"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";
import { supabase } from "@/lib/supabase"; // Import supabase để lấy user

const money = (n) => n.toLocaleString("vi-VN") + " đ";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");

    try {
      // LẤY USER ID NẾU KHÁCH ĐÃ ĐĂNG NHẬP
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          address: f.get("address"),
          items: items.map(({ id, label, color, qty }) => ({ id, label, color, qty })),
          user_id: user ? user.id : null, // Gửi user_id xuống API
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đặt hàng thất bại");

      setOrder({
        code: data.code, 
        name: f.get("name"), 
        phone: f.get("phone"), 
        address: f.get("address"),
        total: data.total,
        items: data.items.map((l, idx) => ({ 
          key: idx, 
          name: l.product_name, 
          label: l.variant_label, 
          color: l.color, 
          price: l.price, 
          qty: l.qty 
        })),
      });
      clear(); // Xóa giỏ hàng sau khi đặt thành công
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // MÀN HÌNH 1: ĐẶT HÀNG THÀNH CÔNG
  // ==========================================
  if (order) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] py-12 px-4 transition-colors duration-300">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-8">
            Mã đơn hàng của bạn là: <span className="text-[#0071e3] font-bold">#{order.code}</span>
          </p>
          
          <div className="bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-2xl p-4 mb-6 text-left">
            <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Thông tin giao hàng:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Người nhận: {order.name} - {order.phone}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ: {order.address}</p>
          </div>

          <ul className="border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 mb-6 text-left bg-white dark:bg-[#1c1c1e]">
            {order.items.map((i) => (
              <li key={i.key} className="p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{i.name}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    {i.label && <span>{i.label} </span>}
                    {i.color && <span>- Màu: {i.color} </span>}
                    <span>× {i.qty}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-800 dark:text-gray-200">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex justify-between items-center mb-8 px-4">
            <span className="text-lg text-gray-600 dark:text-gray-400 font-medium">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">{money(order.total)}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/profile" className="bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-md">
              Xem đơn hàng của tôi
            </Link>
            <Link href="/products" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium px-8 py-3 rounded-xl transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // MÀN HÌNH 2: GIỎ HÀNG TRỐNG
  // ==========================================
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">Giỏ hàng của bạn đang trống.</p>
        <Link href="/products" className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-8 py-3 rounded-xl font-medium transition-colors">
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  // ==========================================
  // MÀN HÌNH 3: FORM ĐIỀN THÔNG TIN
  // ==========================================
  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] py-12 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <Link href="/cart" className="text-sm text-gray-500 hover:text-[#0071e3] mb-6 inline-block font-medium">
          &larr; Quay lại giỏ hàng
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Cột trái: Form thông tin */}
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-3">Thông tin đặt hàng</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên</label>
                <input name="name" required placeholder="VD: Nguyễn Văn A" className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                <input name="phone" required placeholder="VD: 0987654321" className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ nhận hàng</label>
                <input name="address" required placeholder="Số nhà, tên đường, quận/huyện..." className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors" />
              </div>
              
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold text-lg px-6 py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:hover:translate-y-0">
                {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>
            </form>
          </div>

          {/* Cột phải: Tóm tắt đơn */}
          <div>
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-3">Đơn hàng của bạn</h2>
              <ul className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                {items.map((i) => (
                  <li key={i.key} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm line-clamp-1">{i.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {i.label && <span className="mr-2">{i.label}</span>}
                        {i.color && <span className="mr-2">- Màu: {i.color}</span>}
                        <span>SL: {i.qty}</span>
                      </p>
                    </div>
                    <div className="font-bold text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap">
                      {money(i.price * i.qty)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Tổng tiền:</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{money(total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}