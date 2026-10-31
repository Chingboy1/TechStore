"use client";
import Image from "next/image";
import { useState } from "react";
// Dùng icon xịn từ thư viện lucide-react thay vì emoji
import { Smartphone, Tablet, Laptop, Monitor, Cpu, Headphones, Mouse, Keyboard, Speaker, Glasses, ShoppingBag } from "lucide-react";

const ICONS = {
  "dien-thoai": Smartphone,
  "may-tinh-bang": Tablet,
  "laptop": Laptop,
  "pc-theo-nganh": Monitor,
  "linh-kien-pc": Cpu,
  "tai-nghe": Headphones,
  "chuot": Mouse,
  "ban-phim": Keyboard,
  "loa": Speaker,
  "kinh-ai": Glasses,
};

export default function ProductImage({ id, category, name, imageSrc, className = "" }) {
  const [error, setError] = useState(false);

  // 1. Nếu có link ảnh (từ file JSON) và link chưa bị lỗi -> Dùng link online
  const srcToUse = imageSrc ? imageSrc : `/images/${id}.jpg`;

  // 2. Nếu ảnh bị lỗi (không tải được) -> Hiện Icon
  if (error) {
    const IconComponent = ICONS[category] || ShoppingBag;
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 text-gray-300 ${className}`}>
        <IconComponent size={60} strokeWidth={1} />
        <span className="text-xs mt-2 font-medium">Chưa có ảnh</span>
      </div>
    );
  }

  // 3. Hiển thị ảnh bình thường
  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-white dark:bg-[#111] transition-colors duration-300 ${className}`}>
      <img src={srcToUse} alt={name} className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105" onError={() => setError(true)} />
    </div>
  );
}