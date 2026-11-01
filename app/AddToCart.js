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

  const getColorCode = (colorName) => {
    const name = colorName.toLowerCase();
    if (name.includes('đen') || name.includes('black') || name.includes('titan')) return '#333333';
    if (name.includes('trắng') || name.includes('white')) return '#F3F4F6';
    if (name.includes('xanh') || name.includes('blue')) return '#93C5FD';
    if (name.includes('hồng') || name.includes('pink')) return '#F9A8D4';
    if (name.includes('tím') || name.includes('purple')) return '#D8B4FE';
    if (name.includes('vàng') || name.includes('gold')) return '#FDE047';
    if (name.includes('cam') || name.includes('orange')) return '#FDBA74';
    if (name.includes('xám') || name.includes('grey') || name.includes('gray')) return '#9CA3AF';
    if (name.includes('đỏ') || name.includes('red')) return '#FCA5A5';
    return '#D1D5DB';
  };

  return (
    <div className="space-y-8">
      {/* CHỌN PHIÊN BẢN */}
      {variants && variants.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Phiên bản.</p>
          <div className="relative">
            <select
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="appearance-none bg-transparent border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl px-5 py-4 w-full focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all duration-300 cursor-pointer text-lg hover:border-gray-400 dark:hover:border-gray-500"
            >
              {variants.map((v, i) => (
                <option key={v.label} value={i} className="text-gray-900">
                  {v.label} — {v.price.toLocaleString("vi-VN")} đ
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      )}

      {/* CHỌN MÀU SẮC */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            Màu sắc. <span className="text-gray-500 dark:text-gray-400 font-normal">Hiện tại: {selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  selectedColor === color ? "ring-2 ring-[#0071e3] ring-offset-2 dark:ring-offset-[#0a0a0a]" : "hover:scale-110"
                }`}
                title={color}
              >
                <span 
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 shadow-inner transition-transform duration-300"
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
          // Hiệu ứng: Chuyển màu mượt, lún xuống khi bấm (active:scale-[0.98]), bóng đổ phát sáng
          className={`font-semibold text-lg px-8 py-4 rounded-2xl w-full transition-all duration-300 flex items-center justify-center ${
            isAdded 
              ? "bg-[#34c759] text-white shadow-[0_4px_14px_rgba(52,199,89,0.3)] cursor-default" 
              : "bg-[#0071e3] hover:bg-[#0077ED] text-white shadow-[0_4px_14px_rgba(0,113,227,0.3)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.4)] active:scale-[0.98]"
          }`}
        >
          {isAdded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              Đã thêm vào giỏ!
            </>
          ) : (
            "Thêm vào giỏ hàng"
          )}
        </button>
      </div>
    </div>
  );
}