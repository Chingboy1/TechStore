import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, PackageCheck, Clock } from "lucide-react";

export const dynamic = 'force-dynamic'; // Đảm bảo dữ liệu luôn mới mỗi khi tải trang

export default async function AdminPage() {
  // Lấy danh sách đơn hàng mới nhất từ Supabase, kèm theo chi tiết các món đồ
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    return <div className="p-10 text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>;
  }

  // Tính tổng doanh thu
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Header của trang Admin */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi và xử lý đơn đặt hàng của khách</p>
        </div>
        <Link href="/" className="flex items-center gap-2 bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={18} /> Về trang chủ
        </Link>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center">
            <PackageCheck size={28} />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tổng doanh thu</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="p-4 whitespace-nowrap">Mã Đơn</th>
                <th className="p-4 whitespace-nowrap">Khách Hàng</th>
                <th className="p-4">Sản Phẩm</th>
                <th className="p-4 whitespace-nowrap">Tổng Tiền</th>
                <th className="p-4 whitespace-nowrap">Trạng Thái</th>
                <th className="p-4 whitespace-nowrap">Ngày Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào.</td>
                </tr>
              )}
              
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold text-[#0071e3] dark:text-blue-400">{order.code}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">{order.phone}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]" title={order.address}>{order.address}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                    <ul className="list-disc pl-4 space-y-1">
                      {order.order_items?.map((item) => (
                        <li key={item.id}>
                          {item.product_name} {item.variant_label ? `(${item.variant_label})` : ''} x{item.qty}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 font-bold text-red-600 dark:text-red-400">
                    {Number(order.total).toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-semibold">
                      <Clock size={14} /> Chờ xử lý
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('vi-VN', {
                      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}