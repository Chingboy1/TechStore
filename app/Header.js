"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";
import { Search, ShoppingBag, Menu } from "lucide-react";

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

const MENU_DATA = {
  "Laptop": {
    categories: [
      { title: "Khám phá Laptop", links: [{ name: "MacBook Air", href: "/products?q=MacBook Air" }, { name: "MacBook Pro", href: "/products?q=MacBook Pro" }, { name: "Laptop Gaming", href: "/products?q=Gaming" }, { name: "Laptop Văn phòng", href: "/products?q=Văn phòng" }] },
      { title: "Mua sắm theo Hãng", links: [{ name: "Apple", href: "/products?category=laptop&brand=Apple" }, { name: "ASUS", href: "/products?category=laptop&brand=ASUS" }, { name: "Dell", href: "/products?category=laptop&brand=Dell" }, { name: "Lenovo", href: "/products?category=laptop&brand=Lenovo" }] },
    ],
  },
  "Điện thoại": {
    categories: [
      { title: "Khám phá Điện thoại", links: [{ name: "iPhone", href: "/products?q=iPhone" }, { name: "Samsung", href: "/products?q=Samsung" }, { name: "Điện thoại phổ thông", href: "/products?category=dien-thoai" }] },
      { title: "Phụ kiện đi kèm", links: [{ name: "Ốp lưng & Bao da", href: "/products?q=Ốp" }, { name: "Sạc & Cáp", href: "/products?q=Sạc" }, { name: "Tai nghe", href: "/products?category=tai-nghe" }] },
    ],
  },
  "Linh kiện": {
    categories: [
      { title: "Linh kiện máy tính", links: [{ name: "Card màn hình (VGA)", href: "/products?q=VGA" }, { name: "RAM máy tính", href: "/products?q=RAM" }, { name: "Bo mạch chủ (Mainboard)", href: "/products?q=Mainboard" }] },
      { title: "Thiết bị ngoại vi", links: [{ name: "Chuột Gaming", href: "/products?category=chuot" }, { name: "Bàn phím cơ", href: "/products?category=ban-phim" }, { name: "Loa vi tính", href: "/products?category=loa" }] },
    ],
  },
};

export default function Header({ products }) {
  const { count, isMenuOpen, setIsMenuOpen } = useCart();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const [activeMenu, setActiveMenu] = useState(null);
  const menuTimeout = useRef(null);

  const handleMouseEnter = (menuName) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    menuTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); 
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim().length > 0) {
      const searchQuery = removeAccents(value.toLowerCase()).trim();
      const searchWords = searchQuery.split(/\s+/);
      const searchQueryWithDash = searchQuery.replace(/\s+/g, '-');
      const matched = products.filter((p) => {
        const productName = removeAccents(p.name.toLowerCase());
        const productCategory = removeAccents(p.category.toLowerCase());
        return searchWords.every((word) => productName.includes(word) || productCategory.includes(word) || productCategory.includes(searchQueryWithDash));
      }).slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    /* 
      - bg-white/60 (độ trong suốt 60%)
      - backdrop-blur-xl (làm mờ hậu cảnh mạnh)
      - border-none (xóa viền cứng)
      - shadow-sm (bóng đổ cực nhẹ)
    */
    <header 
      className="sticky top-0 z-50 w-full bg-white/60 dark:bg-black/60 backdrop-blur-xl border-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-300"
      onMouseLeave={handleMouseLeave}
    >
      {/* Thanh mảnh hơn (h-[52px] thay vì 64px) */}
      <div className="max-w-7xl mx-auto px-4 h-[52px] flex items-center justify-between gap-8 relative z-50">
        
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <Link href="/" className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
            TechStore.
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-600 dark:text-gray-300 h-full">
          <button onClick={() => setIsMenuOpen(true)} className="hover:text-black dark:hover:text-white transition-colors py-4">
            Danh mục
          </button>
          <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors py-4">
            Cửa hàng
          </Link>

          {Object.keys(MENU_DATA).map((menuName) => (
            <div 
              key={menuName}
              onMouseEnter={() => handleMouseEnter(menuName)}
              className="h-full flex items-center cursor-pointer py-4"
            >
              <span className={`transition-colors ${activeMenu === menuName ? "text-black dark:text-white font-semibold" : "hover:text-black dark:hover:text-white"}`}>
                {menuName}
              </span>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-6 relative z-50">
          <div className="hidden lg:block relative" ref={searchRef}>
            <form action="/products" method="GET">
              <input
                type="search" name="q" value={query} onChange={handleSearch} onFocus={() => setIsFocused(true)}
                placeholder="Tìm kiếm..."
                className="w-40 focus:w-56 bg-gray-500/10 dark:bg-white/10 text-gray-800 dark:text-gray-200 text-[13px] rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 border border-transparent focus:border-gray-200 dark:focus:border-gray-700"
                autoComplete="off"
              />
              <Search size={14} className="absolute left-3 top-2 text-gray-500 dark:text-gray-400" />
            </form>

            {isFocused && query.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-100/50 dark:border-gray-700/50 z-50 transition-colors">
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.id}`} onClick={() => setIsFocused(false)} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-50/50 dark:border-gray-700/50 last:border-0 transition-colors">
                          <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center p-1 flex-shrink-0 shadow-sm">
                            {p.image ? <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-gray-400">Ảnh</span>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">Không tìm thấy kết quả.</div>}
              </div>
            )}
          </div>

          <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {count > 0 && <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
          </Link>
        </div>
      </div>

      {/* LỚP PHỦ MỜ KHI MỞ MEGA MENU */}
      <div 
        className={`fixed inset-0 top-[53px] bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 ${
          activeMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveMenu(null)}
      ></div>

      {/* MEGA MENU XỔ XUỐNG (Trong suốt giống Apple) */}
      <div 
        className={`absolute top-[53px] left-0 w-full bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-none shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out grid ${
          activeMenu ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-10 flex gap-16">
            {activeMenu && MENU_DATA[activeMenu].categories.map((col, index) => (
              <div key={index} className="flex flex-col gap-3 min-w-[200px]">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  {col.title}
                </h3>
                {col.links.map((link, i) => (
                  <Link 
                    key={i} 
                    href={link.href}
                    onClick={() => setActiveMenu(null)}
                    className="text-xl font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}