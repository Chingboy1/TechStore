import os
import json
import sys
import argparse
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv

# Tự động tìm file .env ở thư mục cha (my-shop1)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("https://jnoskrblfxunwaecklwd.supabase.co")
SUPABASE_KEY = os.getenv("sb_secret_UqrGySdWXE8GkhiqVVhVUA_ajWvx4iV")
CATEGORY = os.getenv("CATEGORY", "loa")
SUBCATEGORY = os.getenv("SUBCATEGORY", None)
GROUP_NAME = os.getenv("GROUP_NAME", None)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Chạy thử không ghi vào DB")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Lỗi: Không tìm thấy SUPABASE_URL hoặc SUPABASE_KEY trong file .env")
        sys.exit(1)

    # Đọc dữ liệu từ loa.json
    json_path = Path(__file__).parent / "loa.json"
    if not json_path.exists():
        print(f"❌ Lỗi: Không tìm thấy file {json_path}")
        sys.exit(1)
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Lấy 1 dòng mẫu từ bảng products để xem cấu trúc
    try:
        res = supabase.table("products").select("*").limit(1).execute()
    except Exception as e:
        print(f"❌ Lỗi kết nối bảng products: {e}")
        sys.exit(1)

    existing_cols = list(res.data[0].keys()) if res.data else []
    print(f"📋 Các cột hiện có trong bảng products: {existing_cols}")

    # Map dữ liệu
    mapped_rows = []
    for item in data:
        # Tự tạo slug ID từ tên nếu chưa có
        name = item.get("name") or item.get("ten", "")
        slug = name.lower().replace(" ", "-").replace("đ", "d")
        # Xóa ký tự đặc biệt cơ bản
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        
        # Lấy brand
        brand = item.get("brand")
        if not brand:
            # Thử lấy chữ đầu tiên (bỏ qua chữ "Loa" nếu có)
            words = name.split()
            if words[0].lower() == "loa" and len(words) > 1:
                brand = words[1]
            else:
                brand = words[0]

        row = {
            "id": item.get("id", slug),
            "name": name,
            "brand": brand,
            "price": int(item.get("price", item.get("gia", 0))),
            "description": item.get("description", item.get("mo_ta", "")),
            "specs": item.get("specs", ""),
            "pros": item.get("pros", ""),
            "cons": item.get("cons", ""),
            "category": CATEGORY
        }
        
        if SUBCATEGORY: row["subcategory"] = SUBCATEGORY
        if GROUP_NAME: row["group_name"] = GROUP_NAME

        # Lọc lại chỉ giữ các cột có trong bảng
        filtered_row = {k: v for k, v in row.items() if k in existing_cols or not existing_cols}
        mapped_rows.append(filtered_row)

    if args.dry_run:
        print(f"\n🔍 CHẾ ĐỘ DRY-RUN (Chưa ghi vào DB)")
        print(f"Tổng số dòng sẽ import: {len(mapped_rows)}")
        print("Dòng mẫu đầu tiên:")
        print(json.dumps(mapped_rows[0], ensure_ascii=False, indent=2))
        return

    # Ghi vào DB (Upsert)
    print(f"\n🚀 Đang ghi {len(mapped_rows)} dòng vào bảng products...")
    try:
        response = supabase.table("products").upsert(mapped_rows).execute()
        print(f"✅ Thành công! Đã upsert {len(response.data)} dòng.")
    except Exception as e:
        print(f"❌ Lỗi khi ghi dữ liệu: {e}")

if __name__ == "__main__":
    main()