import Link from "next/link";
import { getProducts, formatPrice } from "@/lib/products";
import ProductImage from "./ProductImage";
import FadeIn from "./FadeIn";
import { Flame, Crosshair } from "lucide-react";

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative text-center pt-16 pb-20 px-4 max-w-5xl mx-auto overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-700/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <FadeIn>
          <div className="relative mb-10 flex justify-center group">
            <img 
              src="/images/doom-banner.gif" 
              alt="DOOM Slayer" 
              className="w-full max-w-[850px] object-contain relative z-10 transition-transform duration-700 group-hover:scale-105 mix-blend-screen drop-shadow-[0_0_40px_rgba(220,38,38,0.7)]" 
            />
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-none text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 uppercase italic drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            Chào mừng đến địa ngục
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <p className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto tracking-widest font-light uppercase border-l-4 border-red-700 pl-4">
            Trang bị vũ khí công nghệ tối tân nhất.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
            <Link 
              href="/products" 
              className="relative group inline-flex items-center justify-center px-10 py-4 bg-[#1a0505] hover:bg-red-800 border border-red-600 text-red-500 hover:text-white font-black uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.9)]"
              style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
            >
              <Flame size={20} className="mr-2 group-hover:animate-bounce" /> Mua sắm ngay
            </Link>
            <Link 
              href="/products?category=laptop" 
              className="group inline-flex items-center justify-center px-10 py-4 text-gray-400 hover:text-red-500 font-black uppercase tracking-widest transition-all duration-300"
            >
              <Crosshair size={20} className="mr-2" /> Khám phá kho vũ khí
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* 2. SẢN PHẨM NỔI BẬT */}
      <section className="max-w-6xl mx-auto px-4 py-20 relative">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent mb-16"></div>

        <FadeIn>
          <h2 className="text-3xl md:text-5xl font-black tracking-widest mb-12 text-center text-white uppercase italic">
            Vũ Khí <span className="text-red-600">Nổi Bật</span>
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProducts.map((p, index) => (
            <FadeIn key={p.id} delay={index * 0.1}>
              <Link 
                href={`/products/${p.id}`} 
                className="group relative bg-[#111] rounded-sm overflow-hidden flex flex-col items-center text-center transition-all duration-300 hover:bg-[#1a0505] p-10 border border-[#333] hover:border-red-600 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] h-full"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}
              >
                <div className="absolute top-4 left-4 bg-red-900/40 border border-red-700 text-red-500 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  {p.brand || "Hàng Mới"}
                </div>

                <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-gray-100 group-hover:text-red-500 transition-colors uppercase italic">{p.name}</h3>
                <p className="text-gray-500 mb-6 max-w-sm line-clamp-2 text-sm">{p.description}</p>
                
                <div className="w-full h-64 mt-auto relative group-hover:-translate-y-2 transition-transform duration-500 bg-white rounded-md p-4 border border-gray-800 group-hover:border-red-600">
                  <ProductImage 
                    id={p.id} 
                    category={p.category} 
                    name={p.name} 
                    imageSrc={p.image} 
                    imageUrl={p.image_url} // LẤY ẢNH TỪ SUPABASE STORAGE
                    className="w-full h-full object-contain" 
                  />
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 w-full flex justify-between items-center">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    {p.variants?.length > 1 ? "Từ " : ""}{formatPrice(p.price)}
                  </span>
                  <span className="text-red-600 group-hover:translate-x-2 transition-transform duration-300 text-xl font-bold">
                    &rarr;
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}