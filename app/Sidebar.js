"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { Smartphone, Tablet, Laptop, Monitor, Cpu, Headphones, Mouse, Keyboard, Speaker, Glasses, LayoutGrid, Menu, X } from "lucide-react";

const iconMap = {
  "dien-thoai": Smartphone, "may-tinh-bang": Tablet, "laptop": Laptop, "pc-theo-nganh": Monitor,
  "linh-kien-pc": Cpu, "tai-nghe": Headphones, "chuot": Mouse, "ban-phim": Keyboard, "loa": Speaker, "kinh-ai": Glasses,
};

export default function Sidebar({ categories }) {
  const { isMenuOpen, setIsMenuOpen } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || isMenuOpen;

  return (
    <>
      {/* Lớp phủ mờ trên Mobile khi mở menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* THANH SIDEBAR HÒA VÀO TRANG */}
         <aside
        onMouseEnter={() => setIsHovered(true)} 
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen bg-transparent transition-all duration-300 ease-in-out z-[60] flex flex-col py-4 overflow-hidden 
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
        ${isExpanded ? "w-[260px]" : "w-[70px]"}`}
      >
      
        <div className="flex items-center justify-between px-4 mb-6 h-10 flex-shrink-0 mt-2">
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="w-10 h-10 bg-gray-200/50 hover:bg-gray-300/50 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
          >
            <Menu size={20} className="text-gray-700 dark:text-gray-300" strokeWidth={2} />
          </div>
          
          {/* Nút X chỉ hiện trên Mobile để đóng menu */}
          {isMenuOpen && (
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="w-8 h-8 flex items-center justify-center bg-gray-200/50 hover:bg-gray-300/50 dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] rounded-full text-gray-600 dark:text-gray-300 transition-colors md:hidden"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden no-scrollbar pb-10 px-2">
          <Link 
            href="/" 
            onClick={() => setIsMenuOpen(false)} 
            className="flex items-center px-2 py-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all group"
          >
            <div className="w-10 flex justify-center flex-shrink-0 text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              <LayoutGrid size={22} strokeWidth={1.5} />
            </div>
            <span className={`ml-2 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
              Tất cả sản phẩm
            </span>
          </Link>

          {categories.map((cat) => {
            const IconComponent = iconMap[cat.slug] || LayoutGrid;
            return (
              <Link 
                key={cat.slug} 
                href={`/products?category=${cat.slug}`} 
                onClick={() => setIsMenuOpen(false)} 
                className="flex items-center px-2 py-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl transition-all group"
              >
                <div className="w-10 flex justify-center flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <IconComponent size={22} strokeWidth={1.5} />
                </div>
                <span className={`ml-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}