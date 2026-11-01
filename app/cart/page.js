"use client";
import Link from "next/link";
import { useCart } from "../CartContext";

const money = (n) => n.toLocaleString("vi-VN") + " đ";

export default function CartPage() {
  const { items, changeQty, removeItem, clear, total } = useCart();

  // ==========================================
  // TRƯỜNG HỢP 1: GIỎ HÀNG TRỐNG
  // ==========================================
  if (items.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-4 transition-colors duration-300">
        <div className="mb-6">
          <img 
            src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" 
            alt="Giỏ hàng trống" 
            className="w-48 h-48 object-contain opacity-80"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Không có sản phẩm nào trong giỏ hàng</p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Link 
            href="/products" 
            className="bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium px-8 py-3 rounded-xl w-full text-center transition-colors shadow-sm"
          >
            Về trang cửa hàng
          </Link>
          
          {/* NÚT TRA CỨU ĐƠN HÀNG KHI GIỎ TRỐNG */}
          <Link 
            href="/track" 
            className="bg-white dark:bg-[#1c1c1e] border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium px-8 py-3 rounded-xl w-full text-center transition-colors shadow-sm"
          >
            Tra cứu đơn hàng
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8 text-center">
          Khi cần trợ giúp vui lòng gọi <span className="text-[#0071e3] dark:text-blue-400 font-semibold">1900.232.460</span> (8h00 - 21h30)
        </p>
      </main>
    );
  }

  // ==========================================
  // TRƯỜNG HỢP 2: GIỎ HÀNG CÓ SẢN PHẨM
  // ==========================================
  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">Giỏ hàng của bạn</h1>
      
      <ul className="divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl mb-6 bg-white dark:bg-[#1c1c1e] shadow-sm">
        {items.map((i) => (
          <li key={i.key} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href={`/products/${i.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-[#0071e3] dark:hover:text-blue-400 text-lg transition-colors">
                {i.name}
              </Link>
              
              {/* HIỂN THỊ PHIÊN BẢN & MÀU SẮC */}
              <div className="mt-2 flex flex-wrap gap-2">
                {i.label && <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">Phiên bản: {i.label}</span>}
                {i.color && <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-md">Màu sắc: {i.color}</span>}
              </div>

              <p className="text-red-600 dark:text-red-400 font-bold mt-2 text-lg">{money(i.price)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button onClick={() => changeQty(i.key, -1)} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-gray-600 dark:text-gray-300">−</button>
                <span className="px-3 py-1.5 bg-white dark:bg-[#1c1c1e] font-medium text-gray-900 dark:text-white">{i.qty}</span>
                <button onClick={() => changeQty(i.key, 1)} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-gray-600 dark:text-gray-300">+</button>
              </div>
              <button onClick={() => removeItem(i.key)} className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
        <p className="text-xl font-bold text-gray-900 dark:text-white">Tổng cộng: <span className="text-red-600 dark:text-red-400 text-2xl">{money(total)}</span></p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button onClick={clear} className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl flex-1 sm:flex-none transition-colors font-medium">
            Xóa hết
          </button>
          
          {/* NÚT TRA CỨU ĐƠN HÀNG KHI CÓ SẢN PHẨM */}
          <Link href="/track" className="border border-[#0071e3] dark:border-blue-500 text-[#0071e3] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-center px-6 py-3 rounded-xl font-medium flex-1 sm:flex-none transition-colors">
            Tra cứu đơn
          </Link>

          <Link href="/checkout" className="bg-[#0071e3] hover:bg-[#0077ED] text-white text-center px-8 py-3 rounded-xl font-bold flex-1 sm:flex-none transition-colors shadow-md shadow-blue-600/20">
            Đặt hàng
          </Link>
        </div>
      </div>
    </main>
  );
}