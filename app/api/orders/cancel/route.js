import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  const { code } = await request.json();
  
  if (!code) return NextResponse.json({ error: "Thiếu mã đơn hàng" }, { status: 400 });

  // Tìm đơn hàng
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, status")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !order) return NextResponse.json({ error: "Không tìm thấy đơn hàng này" }, { status: 404 });

  // Chỉ được hủy khi đang chờ xử lý
  if (order.status !== "pending") {
    return NextResponse.json({ error: "Đơn hàng đã được xử lý, không thể hủy. Vui lòng liên hệ hotline!" }, { status: 400 });
  }

  // Cập nhật sang trạng thái hủy
  await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", order.id);

  return NextResponse.json({ success: true, message: "Đã hủy đơn hàng thành công" });
}