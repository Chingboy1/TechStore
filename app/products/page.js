import Link from "next/link";
import { getProducts, getCategories, formatPrice } from "@/lib/products";
import { filterProducts, getBrands } from "@/lib/filter";
import ProductImage from "../ProductImage";
import BrandFilter from "../BrandFilter";
import FadeIn from "../FadeIn"; // Import FadeIn
import { ChevronRight } from "lucide-react";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  
  const products = await getProducts();
  const categories = await getCategories();
  
  const list = filterProducts(products, params);
  const brands = getBrands(products, category);

  // Component thẻ sản phẩm (Bọc trong FadeIn để có hiệu ứng trượt lên)
  const ProductCard = ({ p, index }) => (
    <FadeIn delay={Math.min(index * 0.05, 0.4)}> 
      <Link 
        href={`/products/${p.id}`} 
        className="bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden transition-all duration-500 ease-out flex flex-col group relative hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-full"
      >
        {index < 3 && (
          <span className={`absolute top-0 left-0 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-br-xl z-10 ${index === 0 ? 'bg-[#ff3b30]' : 'bg-[#0071e3]'}`}>
            {index === 0 ? 'HOT' : 'MỚI'}
          </span>
        )}
        
        <div className="p-6 pb-0 relative overflow-hidden">
           <ProductImage id={p.id} category={p.category} name={p.name} imageSrc={p.image} className="h-48 md:h-56 w-full mb-4" />
        </div>
        
        <div className="p-6 flex flex-col flex-grow z-10">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">{p.brand ?? "TechStore"}</p>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-[#0071e3] dark:group-hover:text-blue-400 transition-colors duration-300">
            {p.name}
          </h3>
          
          <div className="mt-auto pt-3">
            <p className="text-gray-900 dark:text-white font-bold text-xl tracking-tight">{formatPrice(p.price)}</p>
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-500 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Còn hàng
            </div>
          </div>
        </div>
      </Link>
    </FadeIn>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* BANNER */}
      <FadeIn>
        <div className="mb-10 w-full h-[250px] rounded-3xl overflow-hidden relative bg-gradient-to-r from-gray-900 to-gray-800 flex items-center px-10 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="relative z-20 max-w-lg text-white">
            <span className="bg-blue-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block shadow-sm">
              ASUS ROG Series
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Sức Mạnh Đỉnh Cao</h1>
            <p className="text-lg text-gray-300 mb-6">Trải nghiệm Gaming và Đồ họa chuyên nghiệp với dòng Laptop ASUS ROG mới nhất.</p>
            <Link href="/products?q=ASUS" className="bg-blue-600 text-white font-bold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors inline-block shadow-lg shadow-blue-600/30">
              Khám phá ngay
            </Link>
          </div>
          <div className="absolute right-0 top-0 h-full w-2/3 bg-[url('https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay mask-image-linear-to-l"></div>
        </div>
      </FadeIn>

      {/* THANH DANH MỤC */}
      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-3 mb-6 justify-center">
          <Link 
            href="/products" 
            className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
              !category 
                ? "bg-[#0071e3] text-white border-[#0071e3]" 
                : "bg-white dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#0071e3]"
            }`}
          >
            Tất cả
          </Link>
          {categories.map((c) => (
            <Link 
              key={c.slug} 
              href={`/products?category=${c.slug}`} 
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                category === c.slug 
                  ? "bg-[#0071e3] text-white border-[#0071e3]" 
                  : "bg-white dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#0071e3]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* THANH THƯƠNG HIỆU & BỘ LỌC */}
      {(category || params.q || params.brand) && (
        <FadeIn delay={0.15}>
          <BrandFilter brands={brands} category={category} currentBrand={params.brand} />
          
          <div className="bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 mb-8 shadow-sm max-w-5xl mx-auto transition-colors">
            <form className="flex flex-col md:flex-row items-center gap-4 text-sm">
              {category && <input type="hidden" name="category" value={category} />}
              {params.q && <input type="hidden" name="q" value={params.q} />}
              {params.brand && <input type="hidden" name="brand" value={params.brand} />}

              <div className="flex-1 w-full md:w-auto">
                <select name="brand" defaultValue={params.brand ?? ""} className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[#0071e3]">
                  <option value="">Tất cả thương hiệu</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input name="min" type="number" min="0" step="100000" defaultValue={params.min} placeholder="Giá từ..." className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 w-full md:w-32 focus:outline-none focus:border-[#0071e3]" />
                <span className="text-gray-400">-</span>
                <input name="max" type="number" min="0" step="100000" defaultValue={params.max} placeholder="Đến..." className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 w-full md:w-32 focus:outline-none focus:border-[#0071e3]" />
              </div>
              
              <div className="flex-1 w-full md:w-auto">
                <select name="sort" defaultValue={params.sort ?? ""} className="bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-[#0071e3]">
                  <option value="">Sắp xếp: Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <button type="submit" className="bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium px-6 py-2 rounded-lg transition-colors flex-1 md:flex-none">
                  Áp dụng
                </button>
                <Link href="/products" className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-lg text-center transition-colors flex-1 md:flex-none">
                  Xóa lọc
                </Link>
              </div>
            </form>
          </div>
        </FadeIn>
      )}

      {/* HIỂN THỊ SẢN PHẨM */}
      <div id="products">
        {category ? (
          <>
            <FadeIn>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                  {categories.find(c => c.slug === category)?.name}
                  <span className="text-sm font-normal text-gray-500 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">{list.length} sản phẩm</span>
                </h2>
              </div>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {list.map((p, index) => <ProductCard key={p.id} p={p} index={index} />)}
            </div>
          </>
        ) : (
          <div className="space-y-16">
            {categories.map((c) => {
              const categoryProducts = list.filter((p) => p.category === c.slug);
              if (categoryProducts.length === 0) return null; 
              const displayProducts = categoryProducts.slice(0, 5);

              return (
                <section key={c.slug}>
                  <FadeIn>
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200 dark:border-gray-800">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                        {c.name}
                      </h2>
                      <Link 
                        href={`/products?category=${c.slug}`}
                        className="text-[#0071e3] dark:text-blue-400 font-medium hover:underline flex items-center gap-1 group"
                      >
                        Xem tất cả {c.name}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </FadeIn>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {displayProducts.map((p, index) => <ProductCard key={p.id} p={p} index={index} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {list.length === 0 && (
          <FadeIn>
            <div className="text-center py-20 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
              <Link href="/products" className="text-[#0071e3] dark:text-blue-400 font-medium hover:underline">Xóa bộ lọc và thử lại</Link>
            </div>
          </FadeIn>
        )}
      </div>
    </main>
  );
}