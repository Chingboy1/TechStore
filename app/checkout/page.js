"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "../CartContext";

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
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          address: f.get("address"),
          items: items.map(({ id, label, color, qty }) => ({ id, label, color, qty })),
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
          color: l.color, // Lấy màu sắc từ API trả về
          price: l.price, 
          qty: l.qty 
        })),
      });
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <main className="max-w-2xl mx-auto p-6 min-h-screen">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Đặt hàng thành công!</h1>
          <p className="text-gray-500 mb-8">
            Mã đơn hàng của bạn là: <span className="text-blue-600 font-bold">#{order.code}</span>
          </p>
          
          <ul className="border border-gray-200 rounded-xl divide-y divide-gray-100 mb-6 text-left bg-white">
            {order.items.map((i) => (
              <li key={i.key} className="p-4 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800">{i.name}</span>
                  <div className="text-sm text-gray-500 mt-1">
                    {i.label && <span>{i.label} </span>}
                    {i.color && <span>- Màu: {i.color} </span>}
                    <span>× {i.qty}</span>
                  </div>
                </div>
                <span className="font-bold text-gray-800">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          
          <div className="flex justify-between items-center mb-8 px-4 border-t border-gray-100 pt-4">
            <span className="text-lg text-gray-600 font-medium">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-red-600">{money(order.total)}</span>
          </div>
          <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-2xl mx-auto p-6 min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4 text-lg">Giỏ hàng của bạn đang trống.</p>
        <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Tiếp tục mua sắm
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen">
      <Link href="/cart" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block font-medium">&larr; Quay lại giỏ hàng</Link>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cột trái: Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-3">Thông tin đặt hàng</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input name="name" required placeholder="VD: Nguyễn Văn A" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input name="phone" required placeholder="VD: 0987654321" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng</label>
              <input name="address" required placeholder="Số nhà, tên đường, quận/huyện..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:hover:translate-y-0">
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>
          </form>
        </div>

        {/* Cột phải: Tóm tắt đơn */}
        <div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-3">Đơn hàng của bạn</h2>
            <ul className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
              {items.map((i) => (
                <li key={i.key} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm line-clamp-1">{i.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {i.label && <span className="mr-2">{i.label}</span>}
                      {i.color && <span className="mr-2">- Màu: {i.color}</span>}
                      <span>SL: {i.qty}</span>
                    </p>
                  </div>
                  <div className="font-bold text-gray-800 text-sm whitespace-nowrap">
                    {money(i.price * i.qty)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Tổng tiền:</span>
              <span className="text-2xl font-bold text-red-600">{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}