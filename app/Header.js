"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { Search, ShoppingBag, Menu, User } from "lucide-react";

// Hàm bỏ dấu tiếng Việt
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

// Dữ liệu cho Mega Menu
const MENU_DATA = {
  "Laptop": {
    categories: [
      {
        title: "Khám phá Laptop",
        links: [
          { name: "MacBook Air", href: "/products?q=MacBook Air" },
          { name: "MacBook Pro", href: "/products?q=MacBook Pro" },
          { name: "Laptop Gaming", href: "/products?q=Gaming" },
          { name: "Laptop Văn phòng", href: "/products?q=Văn phòng" },
        ],
      },
      {
        title: "Mua sắm theo Hãng",
        links: [
          { name: "Apple", href: "/products?category=laptop&brand=Apple" },
          { name: "ASUS", href: "/products?category=laptop&brand=ASUS" },
          { name: "Dell", href: "/products?category=laptop&brand=Dell" },
          { name: "Lenovo", href: "/products?category=laptop&brand=Lenovo" },
        ],
      },
    ],
  },
  "Điện thoại": {
    categories: [
      {
        title: "Khám phá Điện thoại",
        links: [
          { name: "iPhone", href: "/products?q=iPhone" },
          { name: "Samsung", href: "/products?q=Samsung" },
          { name: "Điện thoại phổ thông", href: "/products?category=dien-thoai" },
        ],
      },
      {
        title: "Phụ kiện đi kèm",
        links: [
          { name: "Ốp lưng & Bao da", href: "/products?q=Ốp" },
          { name: "Sạc & Cáp", href: "/products?q=Sạc" },
          { name: "Tai nghe", href: "/products?category=tai-nghe" },
        ],
      },
    ],
  },
  "Linh kiện": {
    categories: [
      {
        title: "Linh kiện máy tính",
        links: [
          { name: "Card màn hình (VGA)", href: "/products?q=VGA" },
          { name: "RAM máy tính", href: "/products?q=RAM" },
          { name: "Bo mạch chủ (Mainboard)", href: "/products?q=Mainboard" },
        ],
      },
      {
        title: "Thiết bị ngoại vi",
        links: [
          { name: "Chuột Gaming", href: "/products?category=chuot" },
          { name: "Bàn phím cơ", href: "/products?category=ban-phim" },
          { name: "Loa vi tính", href: "/products?category=loa" },
        ],
      },
    ],
  },
};

export default function Header({ products }) {
  const { count, isMenuOpen, setIsMenuOpen } = useCart();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // State quản lý Mega Menu
  const [activeMenu, setActiveMenu] = useState(null);
  const menuTimeout = useRef(null);

  // State quản lý Đăng nhập
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user ban đầu
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Lắng nghe sự thay đổi trạng thái đăng nhập
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Xử lý Mega Menu
  const handleMouseEnter = (menuName) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    menuTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); 
  };

  // Xử lý Tìm kiếm
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
        return searchWords.every((word) => 
          productName.includes(word) || 
          productCategory.includes(word) ||
          productCategory.includes(searchQueryWithDash)
        );
      }).slice(0, 5);
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  };

  // Đóng gợi ý tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center justify-between gap-8 relative z-50">
        
        {/* BÊN TRÁI: LOGO & MENU MOBILE */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
            TechStore.
          </Link>
        </div>

        {/* Ở GIỮA: MENU ĐIỀU HƯỚNG */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400 h-full">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="hover:text-black dark:hover:text-white transition-colors py-5"
          >
            Danh mục
          </button>
          
          <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors py-5">
            Cửa hàng
          </Link>

          {Object.keys(MENU_DATA).map((menuName) => (
            <div 
              key={menuName}
              onMouseEnter={() => handleMouseEnter(menuName)}
              className="h-full flex items-center cursor-pointer py-5"
            >
              <span className={`transition-colors ${activeMenu === menuName ? "text-black dark:text-white font-semibold" : "hover:text-black dark:hover:text-white"}`}>
                {menuName}
              </span>
            </div>
          ))}
        </nav>

        {/* BÊN PHẢI: TÌM KIẾM, TÀI KHOẢN, GIỎ HÀNG */}
        <div className="flex items-center gap-5 relative z-50">
          
          {/* Thanh Tìm Kiếm */}
          <div className="hidden lg:block relative" ref={searchRef}>
            <form action="/products" method="GET">
              <input
                type="search"
                name="q"
                value={query}
                onChange={handleSearch}
                onFocus={() => setIsFocused(true)}
                placeholder="Tìm kiếm..."
                className="w-48 focus:w-64 bg-gray-100 dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:bg-white dark:focus:bg-[#2c2c2e] focus:ring-2 focus:ring-[#0071e3]/20 transition-all duration-300"
                autoComplete="off"
              />
              <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400 dark:text-gray-500" />
            </form>

            {/* Khung gợi ý */}
            {isFocused && query.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 z-50 transition-colors">
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link 
                          href={`/products/${p.id}`}
                          onClick={() => setIsFocused(false)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#2c2c2e] border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gray-100 dark:bg-[#0a0a0a] rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                            {p.image ? (
                               <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                               <span className="text-[10px] text-gray-400">Ảnh</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm line-clamp-1">{p.name}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Không tìm thấy kết quả.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icon Tài Khoản / Đăng nhập */}
          <Link 
            href={user ? "/profile" : "/login"} 
            className="relative text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors" 
            title={user ? "Tài khoản của tôi" : "Đăng nhập"}
          >
            <User size={22} strokeWidth={1.5} />
            {/* Chấm xanh báo hiệu đã đăng nhập */}
            {user && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#0a0a0a] rounded-full"></span>}
          </Link>

          {/* Icon Giỏ Hàng */}
          <Link href="/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">
            <ShoppingBag size={22} strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#0071e3] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ================= LỚP PHỦ MỜ (BACKDROP) ================= */}
      <div 
        className={`fixed inset-0 top-[61px] bg-white/60 dark:bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 ${
          activeMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setActiveMenu(null)}
      ></div>

      {/* ================= MEGA MENU XỔ XUỐNG ================= */}
      <div 
        className={`absolute top-[61px] left-0 w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out grid ${
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
                    className="text-xl font-medium text-gray-900 dark:text-gray-100 hover:text-[#0071e3] dark:hover:text-blue-400 transition-colors"
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