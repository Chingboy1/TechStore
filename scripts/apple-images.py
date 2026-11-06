#!/usr/bin/env python3
"""
Tìm ảnh sản phẩm Apple bằng SerpApi -> tải về, thu nhỏ -> đưa lên Supabase Storage
-> ghi đường dẫn ảnh vào bảng products (cột image_url, gallery) theo đúng id.

Cần cài:   pip install requests pillow
Cần có trong file .env.local (thư mục gốc project):
    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
    SUPABASE_SECRET_KEY=sb_secret_...        (khóa bí mật, KHÔNG chia sẻ cho ai)
    SERPAPI_KEY=...                          (khóa SerpApi)

Cách chạy (nên làm đúng thứ tự):
    python apple_images.py --dry-run --limit 3        # xem thử, chưa tải gì
    python apple_images.py --only iphone-15,ipad-a16  # chạy thật cho vài sản phẩm
    python apple_images.py                            # chạy cho tất cả sản phẩm Apple chưa có ảnh
"""
import argparse, csv, io, json, os, re, sys, time
from pathlib import Path
from urllib.parse import urlparse

import requests
from PIL import Image

BUCKET = "product-images"
OFFICIAL_HOSTS = ["apple.com", "apple.com.vn", "mzstatic.com", "cdn-apple.com"]
QUALIFIERS = {"pro", "max", "plus", "mini", "air", "ultra"}
VIEW_QUERY = {"front": "", "back": "back view", "side": "side view"}
HERE = Path(__file__).resolve().parent

# Tên tiếng Anh dùng để tìm ảnh cho các sản phẩm có tên tiếng Việt (có thể bổ sung thêm)
SEARCH_NAMES = {
    "airpods-the-he-2": "AirPods 2nd generation",
    "airpods-the-he-3-hop-sac-magsafe": "AirPods 3rd generation",
    "airpods-4": "AirPods 4",
    "airpods-4-voi-chu-dong-khu-tieng-on": "AirPods 4 Active Noise Cancellation",
    "airpods-pro-the-he-2-hop-sac-usbc": "AirPods Pro 2 USB-C",
    "airpods-pro-3": "AirPods Pro 3",
    "airpods-max-usbc": "AirPods Max USB-C",
    "airpods-max-2": "AirPods Max 2",
    "airpods-5": "AirPods 5",
    "airpods-5-voi-hop-sac-khong-day": "AirPods 5 wireless charging case",
}


# ---------------------------------------------------------------- cấu hình
def load_env():
    for base in [Path.cwd(), *Path.cwd().parents, HERE, *HERE.parents]:
        f = base / ".env.local"
        if f.exists():
            for line in f.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
            return str(f)
    return None


def need(name):
    v = os.environ.get(name, "").strip()
    if not v:
        sys.exit(f"Thiếu biến {name}. Hãy thêm nó vào file .env.local (xem hướng dẫn ở đầu file).")
    return v


# ---------------------------------------------------------------- Supabase
class Supabase:
    def __init__(self, url, key):
        self.url = url.rstrip("/")
        self.h = {"apikey": key}
        if key.startswith("eyJ"):  # khóa JWT kiểu cũ (service_role)
            self.h["Authorization"] = f"Bearer {key}"

    def apple_products(self, only=None):
        params = {"select": "id,name,image_url,gallery", "brand": "eq.Apple", "order": "id", "limit": "1000"}
        if only:
            params = {"select": "id,name,image_url,gallery", "id": "in.(" + ",".join(only) + ")", "order": "id"}
        r = requests.get(f"{self.url}/rest/v1/products", params=params, headers=self.h, timeout=30)
        if r.status_code >= 400:
            sys.exit(f"Không đọc được bảng products ({r.status_code}): {r.text[:300]}\n"
                     "Nếu báo thiếu cột image_url/gallery, hãy chạy file supabase_apple_specs_colors.sql trước.")
        return r.json()

    def upload(self, path, data):
        h = {**self.h, "Content-Type": "image/jpeg", "x-upsert": "true", "cache-control": "max-age=3600"}
        r = requests.post(f"{self.url}/storage/v1/object/{BUCKET}/{path}", headers=h, data=data, timeout=60)
        if r.status_code >= 400:
            raise RuntimeError(f"upload {r.status_code}: {r.text[:200]}")
        return f"{self.url}/storage/v1/object/public/{BUCKET}/{path}"

    def patch(self, pid, body):
        h = {**self.h, "Content-Type": "application/json", "Prefer": "return=minimal"}
        r = requests.patch(f"{self.url}/rest/v1/products", params={"id": f"eq.{pid}"}, headers=h, json=body, timeout=30)
        if r.status_code >= 400:
            raise RuntimeError(f"cập nhật bảng {r.status_code}: {r.text[:200]}")


# ---------------------------------------------------------------- SerpApi
class Serp:
    def __init__(self, key, base, cache_file):
        self.key, self.base = key, base.rstrip("/")
        self.cache_file = cache_file
        self.cache = json.loads(cache_file.read_text(encoding="utf-8")) if cache_file.exists() else {}
        self.calls = 0

    def images(self, query):
        if query in self.cache:
            return self.cache[query]
        params = {"engine": "google_images", "q": query, "api_key": self.key, "hl": "vi", "gl": "vn", "ijn": 0}
        r = requests.get(f"{self.base}/search.json", params=params, timeout=60)
        self.calls += 1
        data = r.json() if r.content else {}
        if r.status_code >= 400 or data.get("error"):
            raise RuntimeError(f"SerpApi: {data.get('error') or r.status_code}")
        keep = [
            {k: it.get(k) for k in ("position", "title", "source", "link", "original", "original_width", "original_height")}
            for it in data.get("images_results", [])
        ]
        self.cache[query] = keep
        self.cache_file.write_text(json.dumps(self.cache, ensure_ascii=False, indent=1), encoding="utf-8")
        return keep


# ---------------------------------------------------------------- chọn ảnh
def tokens(text):
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def model_tokens(name):
    raw = [t for t in re.findall(r"[A-Za-z0-9]+", name) if t.isascii()]
    out = {t.lower() for t in raw}
    return {t for t in out if t != "inch" and not re.fullmatch(r"\d+(gb|tb)", t)}


def host_ok(url, allowed):
    host = (urlparse(url).hostname or "").lower()
    return any(host == h or host.endswith("." + h) for h in allowed)


def pick(results, name, allowed, min_width=500):
    """Trả về (ảnh tốt nhất, điểm) hoặc (None, lý do)."""
    want = model_tokens(name)
    best, why = None, "không có ảnh nào từ trang chính hãng"
    for it in results:
        url = it.get("original") or ""
        if not url or not host_ok(url, allowed):
            continue
        if (it.get("original_width") or 0) < min_width:
            why = "ảnh quá nhỏ"
            continue
        cand = tokens(" ".join(str(it.get(k) or "") for k in ("title", "link")) + " " + url)
        found = len(want & cand) / max(len(want), 1)
        extras = (cand & QUALIFIERS) - want
        if extras:
            why = f"ảnh của dòng khác ({', '.join(sorted(extras))})"
            continue
        if found < 0.75:
            why = "ảnh không khớp tên sản phẩm"
            continue
        key = (found, -(it.get("position") or 99))
        if best is None or key > best[0]:
            best = (key, it)
    return (best[1], round(best[0][0], 2)) if best else (None, why)


def to_jpeg(raw):
    im = Image.open(io.BytesIO(raw))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.getchannel("A"))
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail((800, 800))
    out = io.BytesIO()
    im.save(out, "JPEG", quality=85, optimize=True)
    return out.getvalue()


def download(url):
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0"}, timeout=45)
    r.raise_for_status()
    if not r.headers.get("content-type", "").startswith("image/"):
        raise RuntimeError("đường dẫn không phải ảnh")
    return r.content


# ---------------------------------------------------------------- chạy chính
def main(argv=None):
    ap = argparse.ArgumentParser(description="Lấy ảnh Apple bằng SerpApi và đưa lên Supabase")
    ap.add_argument("--dry-run", action="store_true", help="chỉ tìm và báo cáo, không tải, không ghi database")
    ap.add_argument("--only", help="chỉ xử lý các id này, cách nhau bằng dấu phẩy")
    ap.add_argument("--limit", type=int, help="chỉ xử lý N sản phẩm đầu tiên")
    ap.add_argument("--force", action="store_true", help="làm lại cả sản phẩm đã có ảnh")
    ap.add_argument("--views", default="front", help="front | front,back,side (mỗi góc tốn thêm 1 lượt tìm SerpApi)")
    ap.add_argument("--allow-host", action="append", default=[], help="cho phép thêm tên miền ảnh, ví dụ example.com")
    ap.add_argument("--sleep", type=float, default=1.0, help="giây nghỉ giữa các sản phẩm")
    args = ap.parse_args(argv)

    env_file = load_env()
    if env_file:
        print(f"Đọc cấu hình từ {env_file}")
    sb = Supabase(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SECRET_KEY"))
    serp = Serp(need("SERPAPI_KEY"), os.environ.get("SERPAPI_BASE", "https://serpapi.com"), HERE / "apple_images_cache.json")
    allowed = OFFICIAL_HOSTS + args.allow_host
    views = [v.strip() for v in args.views.split(",") if v.strip()]
    for v in views:
        if v not in VIEW_QUERY:
            sys.exit(f"Góc ảnh không hợp lệ: {v} (chỉ có front, back, side)")

    overrides_file = HERE / "apple_overrides.json"
    overrides = json.loads(overrides_file.read_text(encoding="utf-8")) if overrides_file.exists() else {}

    only = [x.strip() for x in args.only.split(",")] if args.only else None
    products = sb.apple_products(only)
    if args.limit:
        products = products[: args.limit]
    print(f"Có {len(products)} sản phẩm Apple cần xử lý. Chế độ: {'XEM THỬ' if args.dry_run else 'CHẠY THẬT'}\n")

    report, ok, skipped, failed = [], 0, 0, 0
    for i, p in enumerate(products, 1):
        pid, name = p["id"], p["name"]
        if p.get("image_url") and not args.force and views == ["front"]:
            skipped += 1
            print(f"[{i}/{len(products)}] {pid}: đã có ảnh, bỏ qua")
            continue
        gallery = {g["view"]: g["url"] for g in (p.get("gallery") or []) if isinstance(g, dict) and g.get("view")}
        front_url = p.get("image_url")
        changed = False
        for view in views:
            tag = f"{pid}/{view}"
            ov = overrides.get(pid)
            ov = ov.get(view) if isinstance(ov, dict) else (ov if view == "front" else None)
            row = {"id": pid, "view": view, "status": "", "score": "", "title": "", "image": "", "page": ""}
            try:
                if ov:
                    cand, score = {"original": ov, "title": "(link tự chọn)", "link": ""}, "override"
                else:
                    q = f"{SEARCH_NAMES.get(pid, name)} {VIEW_QUERY[view]} site:apple.com".replace("  ", " ")
                    cand, score = pick(serp.images(q), SEARCH_NAMES.get(pid, name), allowed)
                if not cand:
                    row["status"] = f"không tìm thấy: {score}"
                    failed += 1
                    print(f"[{i}/{len(products)}] ✗ {tag}: {row['status']}")
                    report.append(row)
                    continue
                row.update(score=score, title=cand.get("title") or "", image=cand["original"], page=cand.get("link") or "")
                if args.dry_run:
                    row["status"] = "xem thử"
                    print(f"[{i}/{len(products)}] • {tag}: {cand.get('title')} (điểm {score})\n      {cand['original'][:110]}")
                    report.append(row)
                    continue
                jpg = to_jpeg(download(cand["original"]))
                path = f"{pid}.jpg" if view == "front" else f"{pid}-{view}.jpg"
                public = sb.upload(path, jpg)
                if view == "front":
                    front_url = public
                else:
                    gallery[view] = public
                changed = True
                row["status"] = "ok"
                ok += 1
                print(f"[{i}/{len(products)}] ✓ {tag} -> {path}")
            except Exception as e:  # noqa: BLE001
                row["status"] = f"lỗi: {e}"
                failed += 1
                print(f"[{i}/{len(products)}] ✗ {tag}: {e}")
            report.append(row)
        if changed and not args.dry_run:
            body = {"gallery": [{"view": k, "url": v} for k, v in gallery.items()]}
            if front_url:
                body["image_url"] = front_url
            try:
                sb.patch(pid, body)
            except Exception as e:  # noqa: BLE001
                failed += 1
                print(f"   ✗ ghi database cho {pid}: {e}")
        time.sleep(args.sleep if not args.dry_run else 0)

    out = HERE / "apple_images_report.csv"
    with out.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "view", "status", "score", "title", "image", "page"])
        w.writeheader()
        w.writerows(report)
    print(f"\nXong: {ok} ảnh mới, {skipped} sản phẩm bỏ qua, {failed} lỗi. Đã dùng {serp.calls} lượt tìm SerpApi.")
    print(f"Báo cáo chi tiết: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())