"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { Search, ShoppingBag, Menu, User } from "lucide-react";

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};

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
          { name: "Apple", href: "/products?category=laptop&brand=Apple", subItems: [{ name: "MacBook Air", href: "/products?q=MacBook Air" }, { name: "MacBook Pro", href: "/products?q=MacBook Pro" }] },
          { name: "ASUS", href: "/products?category=laptop&brand=ASUS" },
          { name: "Dell", href: "/products?category=laptop&brand=Dell" },
        ],
      },
    ],
  },
  "Điện thoại": {
    categories: [
      {
        title: "Khám phá Điện thoại",
        links: [
          { name: "iPhone", href: "/products?q=iPhone", subItems: [{ name: "iPhone 15", href: "/products?q=iPhone 15" }, { name: "iPhone 16", href: "/products?q=iPhone 16" }, { name: "iPhone 17", href: "/products?q=iPhone 17" }] },
        ],
      },
    ],
  },
  "Linh kiện": {
    categories: [
      {
        title: "Linh kiện máy tính",
        links: [
          { name: "Card màn hình (VGA)", href: "/products?q=VGA", subItems: [{ name: "RTX 40 Series", href: "/products?q=RTX 40" }] },
          { name: "RAM máy tính", href: "/products?q=RAM" },
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

  const [activeMenu, setActiveMenu] = useState(null);
  const menuTimeout = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleMouseEnter = (menuName) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(menuName);
  };

  const handleMouseLeave = () => {
    menuTimeout.current = setTimeout(() => { setActiveMenu(null); }, 150); 
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
    } else { setSuggestions([]); }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsFocused(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      // Nền đen tuyền, viền dưới màu đỏ sẫm
      className="sticky top-0 z-50 bg-[#050505] border-b-2 border-red-900 shadow-[0_4px_20px_rgba(220,38,38,0.15)] transition-colors duration-300"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center justify-between gap-2 md:gap-8 relative z-50">
        
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-red-500 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          {/* Logo phát sáng, in nghiêng */}
          <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter text-red-600 hover:text-white transition-all duration-300 uppercase italic drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            DOOM.
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase italic tracking-widest text-gray-400 h-full">
          <button onClick={() => setIsMenuOpen(true)} className="hover:text-red-500 hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all py-5">Danh mục</button>
          <Link href="/products" className="hover:text-red-500 hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all py-5">Kho vũ khí</Link>
          {Object.keys(MENU_DATA).map((menuName) => (
            <div key={menuName} onMouseEnter={() => handleMouseEnter(menuName)} className="h-full flex items-center cursor-pointer py-5">
              <span className={`transition-all ${activeMenu === menuName ? "text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "hover:text-red-500"}`}>{menuName}</span>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5 relative z-50">
          <div className="hidden lg:block relative" ref={searchRef}>
            {/* Thanh tìm kiếm góc cạnh, viền đỏ khi click */}
            <form action="/products" method="GET">
              <input
                type="search" name="q" value={query} onChange={handleSearch} onFocus={() => setIsFocused(true)}
                placeholder="Tìm vũ khí..."
                className="w-48 focus:w-64 bg-[#111] text-gray-200 text-sm rounded-none pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-300"
                autoComplete="off"
              />
              <Search size={16} className="absolute left-3.5 top-2.5 text-gray-500" />
            </form>
            {isFocused && query.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-[#050505] rounded-none shadow-2xl overflow-hidden border border-red-900 z-50">
                {suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.id}`} onClick={() => setIsFocused(false)} className="flex items-center gap-3 p-3 hover:bg-red-950/30 border-b border-gray-800 last:border-0 transition-colors">
                          <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center p-1 flex-shrink-0 border border-gray-700">
                            {p.image ? <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-gray-600">Ảnh</span>}
                          </div>
                          <div>
                            <p className="font-bold text-gray-200 text-sm line-clamp-1 uppercase">{p.name}</p>
                            <p className="text-red-500 text-xs font-bold">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : <div className="p-4 text-center text-red-500 text-sm font-bold uppercase">Không tìm thấy vũ khí.</div>}
              </div>
            )}
          </div>

          <Link href={user ? "/profile" : "/login"} className="relative text-gray-400 hover:text-red-500 hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all">
            <User size={22} strokeWidth={2.5} />
            {user && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border border-[#050505] rounded-full animate-pulse"></span>}
          </Link>
          <Link href="/cart" className="relative text-gray-400 hover:text-red-500 hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)] transition-all">
            <ShoppingBag size={22} strokeWidth={2.5} />
            {count > 0 && <span className="absolute -top-1.5 -right-2 bg-red-700 text-white text-[10px] font-bold w-4 h-4 rounded-none flex items-center justify-center border border-red-500">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Mega Menu */}
      <div className={`fixed inset-0 top-[66px] bg-black/90 z-40 transition-opacity duration-300 ${activeMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setActiveMenu(null)}></div>
      <div className={`absolute top-[66px] left-0 w-full bg-[#050505] border-b-2 border-red-900 shadow-2xl overflow-hidden z-50 transition-all duration-300 ease-in-out grid ${activeMenu ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
        <div className="overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8 md:gap-16">
            {activeMenu && MENU_DATA[activeMenu].categories.map((col, index) => (
              <div key={index} className="flex flex-col gap-3 min-w-[200px]">
                <h3 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 border-b border-red-900 pb-1 inline-block">{col.title}</h3>
                {col.links.map((link, i) => (
                  <div key={i} className="group/sub flex flex-col">
                    <Link href={link.href} onClick={() => setActiveMenu(null)} className="text-xl font-bold text-gray-300 hover:text-red-500 transition-colors py-1 inline-block uppercase italic">{link.name}</Link>
                    {link.subItems && (
                      <div className="hidden group-hover/sub:flex flex-col mt-1 pl-3 border-l-2 border-red-800 space-y-2">
                        {link.subItems.map((sub, j) => (
                          <Link key={j} href={sub.href} onClick={() => setActiveMenu(null)} className="text-base text-gray-500 hover:text-red-400 transition-colors">{sub.name}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}