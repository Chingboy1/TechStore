import Link from "next/link";
import { getProducts, formatPrice } from "@/lib/products";
import ProductImage from "./ProductImage";
import FadeIn from "./FadeIn"; // Import component hiệu ứng

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#1d1d1f] dark:text-[#f5f5f7] font-sans transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="text-center pt-32 pb-24 px-4 max-w-4xl mx-auto">
        <FadeIn>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter mb-6 leading-none">
            TechStore.
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-xl md:text-3xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto tracking-tight leading-snug font-light">
            Trải nghiệm những sản phẩm công nghệ đỉnh cao nhất.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="flex justify-center gap-4">
            <Link 
              href="/products" 
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium px-8 py-3.5 rounded-full text-lg transition-all duration-300 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              Mua sắm ngay
            </Link>
            <Link 
              href="/products?category=laptop" 
              className="text-[#0071e3] hover:underline font-medium px-8 py-3.5 rounded-full text-lg flex items-center gap-1 transition-all"
            >
              Tìm hiểu thêm <span className="text-xl">&rsaquo;</span>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* 2. SẢN PHẨM NỔI BẬT */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-12 text-center">
            Sản phẩm nổi bật.
          </h2>
        </FadeIn>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProducts.map((p, index) => (
            // Bọc từng thẻ sản phẩm, delay tăng dần để hiệu ứng nối tiếp nhau
            <FadeIn key={p.id} delay={index * 0.15}>
              <Link 
                href={`/products/${p.id}`} 
                className="group relative bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-[2.5rem] overflow-hidden flex flex-col items-center text-center transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] p-12 border border-transparent dark:border-gray-800 h-full"
              >
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{p.brand || "Mới"}</p>
                <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">{p.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-sm">{p.description}</p>
                <p className="text-[#0071e3] dark:text-blue-400 font-medium mb-8 text-lg">
                  {p.variants?.length > 1 ? "Từ " : ""}{formatPrice(p.price)}
                </p>
                
                <div className="w-full h-72 mt-auto relative group-hover:-translate-y-2 transition-transform duration-500">
                  <ProductImage 
                    id={p.id} 
                    category={p.category} 
                    name={p.name} 
                    imageSrc={p.image} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        
        <FadeIn delay={0.3}>
          <div className="text-center mt-16">
            <Link 
              href="/products" 
              className="text-[#0071e3] dark:text-blue-400 font-medium text-lg hover:underline tracking-tight"
            >
              Xem tất cả sản phẩm &rarr;
            </Link>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}