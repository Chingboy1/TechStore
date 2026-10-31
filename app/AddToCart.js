"use client";
import { useState } from "react";
import { useCart } from "./CartContext";

export default function AddToCart({ product }) {
  const { addItem } = useCart();
  const [idx, setIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [isAdded, setIsAdded] = useState(false);

  const variants = product.variants;
  const variant = variants ? variants[idx] : null;
  const price = variant ? variant.price : product.price;

  if (price === null || price === 0) {
    return <p className="text-orange-500 font-medium">Vui lòng liên hệ cửa hàng để biết giá.</p>;
  }

  const handleAddToCart = () => {
    addItem(product, variant, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Hàm phụ để lấy mã màu (nếu data không có mã màu, tự động chuyển sang màu xám)
  const getColorCode = (colorName) => {
    const name = colorName.toLowerCase();
    if (name.includes('đen') || name.includes('black') || name.includes('titann')) return '#333333';
    if (name.includes('trắng') || name.includes('white')) return '#F3F4F6';
    if (name.includes('xanh') || name.includes('blue')) return '#93C5FD';
    if (name.includes('hồng') || name.includes('pink')) return '#F9A8D4';
    if (name.includes('tím') || name.includes('purple')) return '#D8B4FE';
    if (name.includes('vàng') || name.includes('gold')) return '#FDE047';
    if (name.includes('cam') || name.includes('orange')) return '#FDBA74';
    if (name.includes('xám') || name.includes('grey') || name.includes('gray')) return '#9CA3AF';
    if (name.includes('đỏ') || name.includes('red')) return '#FCA5A5';
    return '#D1D5DB'; // Mặc định màu xám nhạt
  };

  return (
    <div className="space-y-8">
      {/* CHỌN PHIÊN BẢN (Giống hộp select của Apple) */}
      {variants && variants.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Phiên bản.</p>
          <div className="relative">
            <select
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="appearance-none bg-transparent border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-4 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer text-lg"
            >
              {variants.map((v, i) => (
                <option key={v.label} value={i} className="text-gray-900 dark:text-gray-900">
                  {v.label} — {v.price.toLocaleString("vi-VN")} đ
                </option>
              ))}
            </select>
            {/* Mũi tên chỉ xuống */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      )}

      {/* CHỌN MÀU SẮC (Dạng vòng tròn) */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            Màu sắc. <span className="text-gray-500 font-normal">Hiện tại: {selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  selectedColor === color ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900" : "hover:scale-110"
                }`}
                title={color}
              >
                <span 
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                  style={{ backgroundColor: getColorCode(color) }}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* NÚT THÊM VÀO GIỎ */}
      <div>
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`font-semibold text-lg px-8 py-4 rounded-xl w-full transition-all duration-300 flex items-center justify-center ${
            isAdded 
              ? "bg-green-500 text-white cursor-default" 
              : "bg-[#0071e3] hover:bg-[#0077ED] text-white"
          }`}
        >
          {isAdded ? "Đã thêm vào giỏ hàng ✓" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
}