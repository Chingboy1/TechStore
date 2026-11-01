import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Resend } from "resend";
import { orderNotificationEmail } from "@/lib/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================================
// BẢO MẬT CẤP CAO: BỘ NHỚ TẠM LƯU IP ĐỂ CHỐNG SPAM (RATE LIMITING)
// Lưu ý: Cách này dùng bộ nhớ RAM (phù hợp đồ án). Thực tế doanh nghiệp 
// thường dùng Redis hoặc Upstash để lưu trữ phân tán.
// =====================================================================
const ipCache = new Map();
const MAX_REQUESTS_PER_MINUTE = 5; // Giới hạn 5 đơn hàng / 1 phút / 1 IP

export async function POST(request) {
  // --- BẮT ĐẦU KIỂM TRA SPAM ---
  const ip = request.headers.get("x-forwarded-for") || "unknown_ip";
  const now = Date.now();
  
  // Lấy danh sách thời gian request của IP này
  const requestTimes = ipCache.get(ip) || [];
  
  // Lọc ra những request được thực hiện trong vòng 60 giây qua
  const recentRequests = requestTimes.filter((time) => now - time < 60000);
  
  // Nếu vượt quá giới hạn, chặn luôn (Mã lỗi 429: Too Many Requests)
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return NextResponse.json(
      { error: "Hệ thống phát hiện bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút!" }, 
      { status: 429 }
    );
  }
  
  // Cập nhật lại lịch sử request cho IP này
  ipCache.set(ip, [...recentRequests, now]);
  // --- KẾT THÚC KIỂM TRA SPAM ---

  // 1. Đọc dữ liệu từ phía Client
  let body;
  try { 
    body = await request.json(); 
  } catch { 
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 }); 
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").replace(/\s/g, "");
  const address = String(body.address ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];

  // 2. Validate dữ liệu cơ bản
  if (!name || !address) return NextResponse.json({ error: "Vui lòng nhập đủ họ tên và địa chỉ" }, { status: 400 });
  if (!/^(0\d{9}|\+84\d{9})$/.test(phone)) return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
  if (items.length === 0 || items.length > 50) return NextResponse.json({ error: "Giỏ hàng không hợp lệ" }, { status: 400 });

  // 3. BẢO MẬT: Server tự tra giá từ DB, KHÔNG TIN TƯỞNG giá từ Client gửi lên
  const ids = [...new Set(items.map((i) => String(i.id)))];
  const { data: products, error: e0 } = await supabaseAdmin
    .from("products")
    .select("id, name, price, variants")
    .in("id", ids);

  if (e0) return NextResponse.json({ error: "Lỗi kết nối cơ sở dữ liệu" }, { status: 500 });

  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = [];

  for (const i of items) {
    const p = byId.get(String(i.id));
    const qty = Number(i.qty);
    
    if (!p || !Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Sản phẩm không hợp lệ" }, { status: 400 });
    }

    let price = p.price;
    let label = null;
    
    // Nếu sản phẩm có phiên bản, phải tìm lại giá thật của phiên bản đó
    if (p.variants?.length) {
      const v = p.variants.find((x) => x.label === i.label);
      if (!v) return NextResponse.json({ error: `Vui lòng chọn phiên bản cho ${p.name}` }, { status: 400 });
      price = v.price; 
      label = v.label;
    }
    
    if (price == null) {
      return NextResponse.json({ error: `${p.name} chưa có giá, vui lòng liên hệ` }, { status: 400 });
    }

    lines.push({ 
      product_id: p.id, 
      product_name: p.name, 
      variant_label: label, 
      color: i.color || null, // Lưu màu sắc nếu có
      price, 
      qty 
    });
  }

  // 4. Tính tổng tiền thật và tạo mã đơn
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const code = "DH" + Date.now().toString().slice(-7);

  // 5. Lưu vào bảng Orders
  const { data: order, error: e1 } = await supabaseAdmin
    .from("orders")
    .insert({ code, customer_name: name, phone, address, total, status: 'pending' })
    .select("id, code")
    .single();

  if (e1) return NextResponse.json({ error: "Không lưu được đơn hàng" }, { status: 500 });

  // 6. Lưu chi tiết sản phẩm vào bảng Order_items
  const { error: e2 } = await supabaseAdmin
    .from("order_items")
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (e2) {
    // Nếu lỗi, xóa luôn đơn hàng vừa tạo để tránh rác Database
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Không lưu được chi tiết đơn hàng" }, { status: 500 });
  }

  // 7. Gửi Email cho Admin (Bọc trong try/catch để không chặn luồng mua hàng nếu mail lỗi)
  try {
    if (process.env.RESEND_API_KEY && process.env.EMAIL_OWNER) {
      await resend.emails.send({
        from: 'TechStore <onboarding@resend.dev>',
        to: [process.env.EMAIL_OWNER],
        subject: `[Đơn hàng mới] ${order.code} - ${name}`,
        html: orderNotificationEmail(
          { code: order.code, customer_name: name, phone, address, total },
          lines
        ),
      });
    }
  } catch (emailError) {
    console.error("Lỗi gửi email thông báo:", emailError);
  }

  // 8. Trả kết quả về cho Client
  return NextResponse.json({ code: order.code, total, items: lines });
}