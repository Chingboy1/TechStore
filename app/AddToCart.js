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
    return <p className="text-red-500 font-bold uppercase tracking-wider">Vui lòng liên hệ cửa hàng.</p>;
  }

  const handleAddToCart = () => {
    addItem(product, variant, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const getColorCode = (colorName) => {
    const name = colorName.toLowerCase();
    if (name.includes('đen') || name.includes('black') || name.includes('titan')) return '#111';
    if (name.includes('trắng') || name.includes('white')) return '#f3f4f6';
    if (name.includes('xanh') || name.includes('blue')) return '#3b82f6';
    if (name.includes('hồng') || name.includes('pink')) return '#ec4899';
    if (name.includes('tím') || name.includes('purple')) return '#a855f7';
    if (name.includes('vàng') || name.includes('gold')) return '#eab308';
    if (name.includes('cam') || name.includes('orange')) return '#f97316';
    if (name.includes('xám') || name.includes('grey') || name.includes('gray')) return '#9ca3af';
    if (name.includes('đỏ') || name.includes('red')) return '#ef4444';
    return '#D1D5DB';
  };

  return (
    <div className="space-y-8">
      {/* CHỌN MÀU SẮC */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="font-bold text-gray-300 mb-3 uppercase tracking-widest text-sm">
            Màu sắc: <span className="text-red-500">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-4">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`relative w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 border-2 ${
                  selectedColor === color ? "border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110" : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <span 
                  className="w-6 h-6 rounded-sm border border-gray-900"
                  style={{ backgroundColor: getColorCode(color) }}
                ></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CHỌN PHIÊN BẢN */}
      {variants && variants.length > 0 && (
        <div>
          <p className="font-bold text-gray-300 mb-3 uppercase tracking-widest text-sm">Phiên bản:</p>
          <div className="relative">
            <select
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="appearance-none bg-[#050505] border border-gray-700 text-gray-200 font-bold rounded-sm px-4 py-4 w-full focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer uppercase text-sm"
            >
              {variants.map((v, i) => (
                <option key={v.label} value={i}>
                  {v.label} — {v.price.toLocaleString("vi-VN")} đ
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      )}

      {/* NÚT THÊM VÀO GIỎ */}
      <div>
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`font-black uppercase tracking-widest text-lg px-8 py-4 rounded-sm w-full transition-all duration-300 flex items-center justify-center ${
            isAdded 
              ? "bg-green-700 text-white shadow-[0_0_20px_rgba(21,128,61,0.6)]" 
              : "bg-red-800 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] active:scale-[0.98]"
          }`}
          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
          {isAdded ? "Đã nạp đạn vào giỏ!" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </div>
  );
}