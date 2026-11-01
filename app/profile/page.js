"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, LogOut, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Lấy đơn hàng của user hiện tại
      const { data } = await supabase
        .from("orders")
        .select(`*, order_items (*)`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setOrders(data || []);
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>;

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a]">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tài khoản của tôi</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lịch sử đơn hàng</h2>
      
      {orders.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className="text-[#0071e3] font-medium hover:underline mt-2 inline-block">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                <div>
                  <p className="font-bold text-[#0071e3]">{order.code}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.status === 'pending' ? 'Chờ xử lý' :
                   order.status === 'processing' ? 'Đang đóng gói' :
                   order.status === 'shipping' ? 'Đang giao' :
                   order.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                </span>
              </div>
              
              <ul className="space-y-2 mb-4">
                {order.order_items?.map(item => (
                  <li key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{item.product_name} x{item.qty}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="font-medium text-gray-900 dark:text-white">Tổng tiền:</span>
                <span className="font-bold text-red-600 dark:text-red-400 text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}