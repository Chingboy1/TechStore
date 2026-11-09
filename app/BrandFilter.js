"use client";
import { useState } from "react";
import Link from "next/link";

export default function BrandFilter({ brands = [], category, currentBrand }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 12;
  
  const displayedBrands = isExpanded ? brands : brands.slice(0, INITIAL_COUNT);
  const hasMore = brands.length > INITIAL_COUNT;

  if (brands.length === 0) return null;

  const getUrl = (brand) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    return `/products?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mb-10 bg-[#111] p-4 rounded-sm border border-[#333] shadow-sm max-w-5xl mx-auto">
      <span className="font-doom text-lg text-gray-400 tracking-wider mr-2 whitespace-nowrap mt-1">
        Thương hiệu:
      </span>
      
      <Link 
        href={getUrl("")}
        className={`font-doom px-4 py-1.5 rounded-sm text-lg tracking-wider border-2 transition-all ${
          !currentBrand 
            ? "bg-red-700 text-white border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
            : "bg-[#050505] text-gray-400 border-[#333] hover:border-red-600 hover:text-red-500"
        }`}
      >
        Tất cả
      </Link>

      {displayedBrands.map((b) => (
        <Link 
          key={b} 
          href={getUrl(b)} 
          className={`font-doom px-4 py-1.5 rounded-sm text-lg tracking-wider border-2 transition-all ${
            currentBrand === b 
              ? "bg-red-700 text-white border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
              : "bg-[#050505] text-gray-400 border-[#333] hover:border-red-600 hover:text-red-500"
          }`}
        >
          {b}
        </Link>
      ))}

      {hasMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="font-doom px-4 py-1.5 rounded-sm text-lg tracking-wider border-2 border-dashed border-gray-600 text-red-500 hover:text-white hover:border-red-500 transition-colors ml-2"
        >
          {isExpanded ? "Thu gọn" : `+ ${brands.length - INITIAL_COUNT} hãng khác`}
        </button>
      )}
    </div>
  );
}