import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    let supabaseQuery = supabaseAdmin
      .from("products")
      .select("id, name, price, description, category")
      .limit(5);

    if (query) {
      supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      return NextResponse.json(
        { error: "Lỗi lấy dữ liệu" },
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const formattedData = data.map(product => ({
      ...product,
      price: product.price ? `${product.price.toLocaleString('vi-VN')} đ` : "Liên hệ"
    }));

    return NextResponse.json(
      { success: true, total: data.length, products: formattedData },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi Server" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}