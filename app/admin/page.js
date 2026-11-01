import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, PackageCheck, Clock, Truck, XCircle, CheckCircle2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

// Các trạng thái đơn hàng
const STATUS_MAP = {
  pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  processing: { label: "Đang đóng gói", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: PackageCheck },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Truck },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

export default async function AdminPage() {
  // Lấy danh sách đơn hàng
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`*, order_items (*)`)
    .order("created_at", { ascending: false });

  if (error) return <div className="p-10 text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>;

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

  // Server Action: Cập nhật trạng thái
  async function updateStatus(formData) {
    "use server";
    const id = formData.get("id");
    const status = formData.get("status");
    await supabaseAdmin.from("orders").update({ status }).eq("id", id);
    revalidatePath("/admin"); // Làm mới lại bảng
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] transition-colors duration-300">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Theo dõi và xử lý đơn đặt hàng</p>
        </div>
        <Link href="/" className="flex items-center gap-2 bg-white dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={18} /> Về trang chủ
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center"><ShoppingBag size={28} /></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tổng đơn hàng</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center"><PackageCheck size={28} /></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tổng doanh thu (đã trừ hủy)</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <th className="p-4 whitespace-nowrap">Mã Đơn / Ngày</th>
                <th className="p-4 whitespace-nowrap">Khách Hàng</th>
                <th className="p-4">Sản Phẩm</th>
                <th className="p-4 whitespace-nowrap">Tổng Tiền</th>
                <th className="p-4 whitespace-nowrap">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders?.map((order) => {
                const currentStatus = STATUS_MAP[order.status] || STATUS_MAP.pending;
                const StatusIcon = currentStatus.icon;

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-bold text-[#0071e3] dark:text-blue-400">{order.code}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[150px]" title={order.address}>{order.address}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                      <ul className="list-disc pl-4 space-y-1">
                        {order.order_items?.map((item) => (
                          <li key={item.id}>{item.product_name} {item.variant_label ? `(${item.variant_label})` : ''} x{item.qty}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-red-600 dark:text-red-400">{Number(order.total).toLocaleString('vi-VN')} đ</td>
                    <td className="p-4">
                      {/* Form cập nhật trạng thái */}
                      <form action={updateStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={order.id} />
                        <select 
                          name="status" 
                          defaultValue={order.status}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none outline-none cursor-pointer ${currentStatus.color}`}
                        >
                          {Object.entries(STATUS_MAP).map(([key, value]) => (
                            <option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                              {value.label}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors">
                          Lưu
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}