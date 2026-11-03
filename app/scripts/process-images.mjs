import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const IN = "inbox";
const OUT = "public/images";
fs.mkdirSync(IN, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const valid = new Set(
  JSON.parse(fs.readFileSync("data/products.json", "utf8")).products.map((p) => p.id)
);
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

let ok = 0;
for (const file of fs.readdirSync(IN)) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) continue;

  const name = path.basename(file, ext);
  const id = name.replace(/-(back|side|extra)$/, "");
  if (!valid.has(id)) {
    console.log(`✗ Bỏ qua ${file}: không có sản phẩm nào có id "${id}"`);
    continue;
  }

  try {
    execFileSync("convert", [
      path.join(IN, file),
      "-auto-orient",
      "-resize", "800x800>",
      "-background", "white", "-alpha", "remove", "-alpha", "off",
      "-quality", "85",
      path.join(OUT, `${name}.jpg`),
    ]);
    ok++;
  } catch {
    console.log(`✗ Lỗi khi xử lý ${file}`);
  }
}
console.log(`Đã xử lý ${ok} ảnh vào ${OUT}`);