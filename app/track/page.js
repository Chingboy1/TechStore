"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Clock, PackageCheck, Truck, CheckCircle2, XCircle } from "lucide-react";

const STATUS_MAP = {
  pending: { label: "Chờ xử lý", icon: Clock, color: "text-yellow-500" },
  processing: { label: "Đang đóng gói", icon: PackageCheck, color: "text-blue-500" },
  shipping: { label: "Đang giao hàng", icon: Truck, color: "text-purple-500" },
  delivered: { label: "Đã giao thành công", icon: CheckCircle2, color: "text-green-500" },
  cancelled: { label: "Đã hủy", icon: XCircle, color: "text-red-500" },
};

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: order.code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      setOrder({ ...order, status: "cancelled" });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] py-12 px-4 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Theo dõi đơn hàng</h1>
          <p className="text-gray-500 dark:text-gray-400">Nhập mã đơn hàng (VD: DH1234567) để kiểm tra trạng thái</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-8 bg-white dark:bg-[#1c1c1e] p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)}
            placeholder="Nhập mã đơn hàng..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-800 dark:text-white uppercase font-medium placeholder:normal-case"
            required
          />
          <button type="submit" disabled={loading} className="bg-[#0071e3] text-white px-6 py-2 rounded-xl font-medium hover:bg-[#0077ED] transition-colors flex items-center gap-2 disabled:opacity-50">
            <Search size={18} /> {loading ? "Đang tìm..." : "Tìm kiếm"}
          </button>
        </form>

        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

        {order && (
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="text-xl font-bold text-[#0071e3]">{order.code}</p>
                <p className="text-sm text-gray-500 mt-2">Người nhận: <span className="font-medium text-gray-700 dark:text-gray-300">{order.customer_name}</span></p>
                <p className="text-sm text-gray-500">SĐT: <span className="font-medium text-gray-700 dark:text-gray-300">{order.phone}</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ngày đặt</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 -z-10 -translate-y-1/2"></div>
              {Object.entries(STATUS_MAP).filter(([key]) => key !== 'cancelled').map(([key, value]) => {
                const isActive = order.status === key;
                const isPassed = Object.keys(STATUS_MAP).indexOf(order.status) > Object.keys(STATUS_MAP).indexOf(key) && order.status !== 'cancelled';
                const Icon = value.icon;
                
                return (
                  <div key={key} className="flex flex-col items-center gap-2 bg-white dark:bg-[#1c1c1e] px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive || isPassed ? 'bg-[#0071e3] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-xs font-medium text-center ${isActive || isPassed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{value.label}</span>
                  </div>
                );
              })}
            </div>

            {order.status === 'cancelled' && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 mb-6">
                <XCircle size={24} />
                <p className="font-medium">Đơn hàng này đã bị hủy.</p>
              </div>
            )}

            <div className="bg-[#f5f5f7] dark:bg-[#0a0a0a] rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Sản phẩm:</h3>
              <ul className="space-y-2">
                {order.order_items?.map(item => (
                  <li key={item.id || item.product_id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>{item.product_name} {item.variant_label && `(${item.variant_label})`} x{item.qty}</span>
                    <span className="font-semibold">{Number(item.price * item.qty).toLocaleString('vi-VN')} đ</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 dark:border-gray-800 mt-3 pt-3 flex justify-between font-bold text-lg">
                <span className="text-gray-900 dark:text-white">Tổng:</span>
                <span className="text-red-600 dark:text-red-400">{Number(order.total).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {order.status === 'pending' && (
              <button onClick={handleCancel} disabled={loading} className="w-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 py-3 rounded-xl font-bold transition-colors disabled:opacity-50">
                {loading ? "Đang xử lý..." : "Hủy đơn hàng này"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}