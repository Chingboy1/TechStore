"use client";
import { useState } from "react";
import { Smartphone, Tablet, Laptop, Monitor, Cpu, Headphones, Mouse, Keyboard, Speaker, Glasses, ShoppingBag } from "lucide-react";

const ICONS = {
  "dien-thoai": Smartphone, "may-tinh-bang": Tablet, "laptop": Laptop,
  "pc-theo-nganh": Monitor, "linh-kien-pc": Cpu, "tai-nghe": Headphones,
  "chuot": Mouse, "ban-phim": Keyboard, "loa": Speaker, "kinh-ai": Glasses,
};

export default function ProductImage({ id, category, name, imageSrc, className = "" }) {
  const [error, setError] = useState(false);
  const srcToUse = imageSrc ? imageSrc : `/images/${id}.jpg`;

  if (error) {
    const IconComponent = ICONS[category] || ShoppingBag;
    return (
      <div className={`flex flex-col items-center justify-center bg-transparent text-gray-300 dark:text-gray-600 ${className}`}>
        <IconComponent size={60} strokeWidth={1} />
        <span className="text-xs mt-2 font-medium">Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-transparent ${className}`}>
      <img 
        src={srcToUse} 
        alt={name} 
        // Hiệu ứng: Thời gian chuyển động lâu hơn (duration-700), nhịp điệu mượt mà (ease-in-out)
        className="w-full h-full object-contain p-2 transition-transform duration-700 ease-in-out group-hover:scale-110 mix-blend-multiply dark:mix-blend-normal" 
        onError={() => setError(true)} 
      />
    </div>
  );
}