"use client";
import Link from "next/link";
import { useCart } from "../CartContext";

const money = (n) => n.toLocaleString("vi-VN") + " đ";

export default function CartPage() {
  const { items, changeQty, removeItem, clear, total } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="mb-6">
          <img 
            src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" 
            alt="Giỏ hàng trống" 
            className="w-48 h-48 object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h1>
        <p className="text-gray-500 mb-8">Không có sản phẩm nào trong giỏ hàng</p>
        <Link 
          href="/products" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg w-full max-w-md text-center transition-colors"
        >
          Về trang cửa hàng
        </Link>
        <p className="text-xs text-gray-500 mt-6 text-center">
          Khi cần trợ giúp vui lòng gọi <span className="text-blue-600 font-semibold">1900.232.460</span> (8h00 - 21h30)
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Giỏ hàng của bạn</h1>
      
      <ul className="divide-y divide-gray-200 border border-gray-200 rounded-xl mb-6 bg-white shadow-sm">
        {items.map((i) => (
          <li key={i.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href={`/products/${i.id}`} className="font-semibold text-gray-800 hover:text-blue-600 text-lg">{i.name}</Link>
              
              {/* HIỂN THỊ PHIÊN BẢN & MÀU SẮC */}
              <div className="mt-1 flex flex-wrap gap-2">
                {i.label && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Phiên bản: {i.label}</span>}
                {i.color && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Màu sắc: {i.color}</span>}
              </div>

              <p className="text-red-600 font-bold mt-2 text-lg">{money(i.price)}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => changeQty(i.key, -1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 transition-colors font-bold text-gray-600">−</button>
                <span className="px-3 py-1 bg-white font-medium">{i.qty}</span>
                <button onClick={() => changeQty(i.key, 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-200 transition-colors font-bold text-gray-600">+</button>
              </div>
              <button onClick={() => removeItem(i.key)} className="text-red-500 hover:text-red-700 text-sm font-medium">Xóa</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 pt-6">
        <p className="text-xl font-bold text-gray-900">Tổng cộng: <span className="text-red-600">{money(total)}</span></p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={clear} className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg flex-1 sm:flex-none transition-colors font-medium">Xóa hết</button>
          <Link href="/checkout" className="bg-blue-600 hover:bg-blue-700 text-white text-center px-8 py-3 rounded-lg font-bold flex-1 sm:flex-none transition-colors shadow-md shadow-blue-600/20">
            Đặt hàng
          </Link>
        </div>
      </div>
    </main>
  );
}