import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Tạm thời comment phần Resend lại nếu chưa cài được thư viện
// import { Resend } from "resend";
// import { orderNotificationEmail } from "@/lib/email-template";
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 }); }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").replace(/\s/g, "");
  const address = String(body.address ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!name || !address) return NextResponse.json({ error: "Vui lòng nhập đủ họ tên và địa chỉ" }, { status: 400 });
  if (!/^(0\d{9}|\+84\d{9})$/.test(phone)) return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  if (items.length === 0 || items.length > 50) return NextResponse.json({ error: "Giỏ hàng không hợp lệ" }, { status: 400 });

  const ids = [...new Set(items.map((i) => String(i.id)))];
  const { data: products, error: e0 } = await supabaseAdmin.from("products").select("id, name, price, variants").in("id", ids);
  if (e0) return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = [];

  for (const i of items) {
    const p = byId.get(String(i.id));
    const qty = Number(i.qty);
    if (!p || !Number.isInteger(qty) || qty < 1) return NextResponse.json({ error: "Sản phẩm không hợp lệ" }, { status: 400 });

    let price = p.price;
    let label = null;
    if (p.variants?.length) {
      const v = p.variants.find((x) => x.label === i.label);
      if (!v) return NextResponse.json({ error: `Vui lòng chọn phiên bản cho ${p.name}` }, { status: 400 });
      price = v.price; label = v.label;
    }
    if (price == null) return NextResponse.json({ error: `${p.name} chưa có giá` }, { status: 400 });

    lines.push({ 
      product_id: p.id, 
      product_name: p.name, 
      variant_label: label, 
      // color: i.color || null, // Tạm thời ẩn màu sắc nếu database chưa có cột này
      price, 
      qty 
    });
  }

  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const code = "DH" + Date.now().toString().slice(-7);

  const { data: order, error: e1 } = await supabaseAdmin.from("orders").insert({ code, customer_name: name, phone, address, total }).select("id, code").single();
  if (e1) {
    console.error("Lỗi lưu bảng orders:", e1);
    return NextResponse.json({ error: "Không lưu được đơn hàng" }, { status: 500 });
  }

  const { error: e2 } = await supabaseAdmin.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (e2) {
    console.error("Lỗi lưu bảng order_items:", e2);
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Không lưu được đơn hàng" }, { status: 500 });
  }

  // Phần gửi Email sẽ được bật lại sau khi cài được Resend
  /*
  try {
    await resend.emails.send({
      from: 'TechStore <onboarding@resend.dev>',
      to: [process.env.EMAIL_OWNER],
      subject: `[Đơn hàng mới] ${order.code} - ${name}`,
      html: orderNotificationEmail(...),
    });
  } catch (emailError) {
    console.error("Lỗi gửi email:", emailError);
  }
  */

  return NextResponse.json({ code: order.code, total, items: lines });
}