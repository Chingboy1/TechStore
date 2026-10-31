"use client";
import { useState } from "react";
import Link from "next/link";

export default function BrandFilter({ brands, category, currentBrand }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Số lượng thương hiệu hiển thị mặc định
  const INITIAL_COUNT = 12;
  
  // Lấy danh sách hiển thị (cắt bớt nếu chưa mở rộng)
  const displayedBrands = isExpanded ? brands : brands.slice(0, INITIAL_COUNT);
  
  // Kiểm tra xem có cần hiện nút "Xem thêm" không
  const hasMore = brands.length > INITIAL_COUNT;

  if (brands.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-5xl mx-auto transition-colors">
      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 mr-2 whitespace-nowrap">
        Thương hiệu:
      </span>
      
      {/* Nút Tất cả */}
      <Link 
        href={category ? `/products?category=${category}` : "/products"} 
        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
          !currentBrand 
            ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-800 dark:border-gray-200" 
            : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
        }`}
      >
        Tất cả
      </Link>

      {/* Danh sách các hãng */}
      {displayedBrands.map((b) => (
        <Link 
          key={b} 
          href={`/products?${category ? `category=${category}&` : ""}brand=${b}`} 
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
            currentBrand === b 
              ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-800 dark:border-gray-200" 
              : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400"
          }`}
        >
          {b}
        </Link>
      ))}

      {/* Nút Xem thêm / Thu gọn */}
      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ml-2"
        >
          {isExpanded ? "Thu gọn" : `+ ${brands.length - INITIAL_COUNT} hãng khác`}
        </button>
      )}
    </div>
  );
}