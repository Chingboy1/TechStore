import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" },
  });
}

// Hàm bỏ dấu tiếng Việt
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    // Lấy TẤT CẢ sản phẩm (với 169 sp thì tốc độ vẫn cực nhanh)
    const { data: allProducts, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, description, category, brand, variants");

    if (error) throw error;

    let results = [];

    if (q && q.trim().length > 0) {
      const searchWords = removeAccents(q).split(/\s+/).filter(w => w.length > 1);

      // Chấm điểm sản phẩm dựa trên số từ khóa khớp
      const scored = allProducts.map(p => {
        const productText = removeAccents(`${p.name} ${p.brand || ""} ${p.category || ""}`);
        let score = 0;
        searchWords.forEach(word => {
          if (productText.includes(word)) score++;
        });
        return { ...p, score };
      }).filter(p => p.score > 0);

      // Sắp xếp theo điểm giảm dần
      scored.sort((a, b) => b.score - a.score);
      
      // Lấy top 5 sản phẩm tốt nhất
      results = scored.slice(0, 5);

    } else {
      // Nếu không có từ khóa, trả về 5 sản phẩm mới nhất/đầu tiên
      results = allProducts.slice(0, 5);
    }

    const formattedData = results.map(product => ({
      ...product,
      price: product.price ? `${product.price.toLocaleString('vi-VN')} đ` : "Liên hệ"
    }));

    return NextResponse.json(
      { success: true, total: formattedData.length, products: formattedData },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi Server" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}