"use client";
import { useState } from "react";
import { Smartphone, Tablet, Laptop, Monitor, Cpu, Headphones, Mouse, Keyboard, Speaker, Glasses, ShoppingBag } from "lucide-react";

const ICONS = {
  "dien-thoai": Smartphone, "may-tinh-bang": Tablet, "laptop": Laptop,
  "pc-theo-nganh": Monitor, "linh-kien-pc": Cpu, "tai-nghe": Headphones,
  "chuot": Mouse, "ban-phim": Keyboard, "loa": Speaker, "kinh-ai": Glasses,
};

export default function ProductImage({ id, category, name, imageSrc, imageUrl, className = "" }) {
  const [error, setError] = useState(false);
  
  // Ưu tiên lấy ảnh từ Supabase Storage (imageUrl), nếu không có thì lấy ảnh cũ
  const srcToUse = imageUrl || imageSrc || `/images/${id}.jpg`;

  if (error) {
    const IconComponent = ICONS[category] || ShoppingBag;
    return (
      <div className={`flex flex-col items-center justify-center bg-[#1a0505] text-red-600 ${className}`}>
        <IconComponent size={60} strokeWidth={1} className="drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
        <span className="text-xs mt-2 font-bold uppercase tracking-wider text-red-500">Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-white ${className}`}>
      <img 
        src={srcToUse} 
        alt={name} 
        className="w-full h-full object-contain p-2 transition-transform duration-700 ease-in-out group-hover:scale-110" 
        onError={() => setError(true)} 
      />
    </div>
  );
}