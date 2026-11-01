import { notFound } from "next/navigation";
import { getProduct, getProducts, formatPrice } from "@/lib/products"; // Thêm getProducts
import Link from "next/link";
import AddToCart from "../../AddToCart";
import ProductImage from "../../ProductImage";
import FadeIn from "../../FadeIn";
import { CheckCircle2, XCircle, ChevronRight } from "lucide-react"; // Thêm ChevronRight

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  
  if (!p) notFound();

  // LẤY SẢN PHẨM LIÊN QUAN
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((item) => item.category === p.category && item.id !== p.id) // Cùng danh mục và khác ID hiện tại
    .slice(0, 4); // Chỉ lấy tối đa 4 sản phẩm

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-8 space-x-2">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cửa hàng</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{p.name}</span>
        </nav>
      </FadeIn>
      
      {/* KHỐI TRÊN: ẢNH & THÔNG TIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start mb-20">
        
        {/* Cột trái: Ảnh */}
        <FadeIn delay={0.1}>
          <div className="sticky top-24 bg-gray-50 dark:bg-[#1c1c1e] rounded-[2rem] p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px] transition-colors duration-300">
            <ProductImage 
              id={p.id} 
              category={p.category} 
              name={p.name} 
              imageSrc={p.image} 
              className="w-full h-full max-h-[500px] object-contain mix-blend-multiply dark:mix-blend-normal" 
            />
          </div>
        </FadeIn>

        {/* Cột phải: Thông tin */}
        <FadeIn delay={0.2}>
          <div className="flex flex-col pt-4">
            {p.brand && <p className="text-sm font-semibold text-[#ff3b30] uppercase tracking-widest mb-2">Mới</p>}
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-gray-900 dark:text-white leading-tight tracking-tight">
              {p.name}
            </h1>
            <p className="text-2xl font-normal text-gray-900 dark:text-gray-100 mb-8">
              {formatPrice(p.price)}
            </p>
            
            <div className="mb-10">
              <AddToCart product={{ id: p.id, name: p.name, price: p.price, variants: p.variants, colors: p.colors }} />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">Giao hàng miễn phí</p>
                  <p>Nhận hàng trong 2-3 ngày làm việc.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* KHỐI DƯỚI: THÔNG TIN CHI TIẾT */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-16 space-y-16 mb-24">
        
        {/* Mô tả */}
        {p.description && (
          <FadeIn>
            <section className="max-w-3xl">
              <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white tracking-tight">Tổng quan</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                {p.description}
              </p>
            </section>
          </FadeIn>
        )}

        {/* Thông số kỹ thuật */}
        {p.specs && p.specs.length > 0 && (
          <FadeIn>
            <section>
              <h2 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white tracking-tight">Thông số kỹ thuật</h2>
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {p.specs.map((spec, index) => (
                  <div key={index} className="flex flex-col border-b border-gray-100 dark:border-gray-800 pb-4">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{spec.label}</span>
                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* Ưu nhược điểm */}
        {(p.pros || p.cons) && (
          <FadeIn>
            <section className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
              {p.pros && (
                <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] p-8 rounded-3xl border border-transparent dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-500" /> Ưu điểm
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">{p.pros}</p>
                </div>
              )}
              {p.cons && (
                <div className="bg-[#f5f5f7] dark:bg-[#1c1c1e] p-8 rounded-3xl border border-transparent dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <XCircle size={20} className="text-red-500" /> Nhược điểm
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">{p.cons}</p>
                </div>
              )}
            </section>
          </FadeIn>
        )}
      </div>

      {/* ================= KHỐI SẢN PHẨM LIÊN QUAN ================= */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-16">
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
                Có thể bạn cũng thích
              </h2>
              <Link 
                href={`/products?category=${p.category}`}
                className="text-[#0071e3] dark:text-blue-400 font-medium hover:underline flex items-center gap-1 group text-sm"
              >
                Xem tất cả
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((rp, index) => (
              <FadeIn key={rp.id} delay={index * 0.1}>
                <Link 
                  href={`/products/${rp.id}`}
                  className="bg-[#f5f5f7] dark:bg-[#1c1c1e] rounded-3xl p-4 flex flex-col items-center text-center group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full border border-transparent dark:border-gray-800"
                >
                  <div className="w-full h-40 mb-4 relative">
                    <ProductImage 
                      id={rp.id} 
                      category={rp.category} 
                      name={rp.name} 
                      imageSrc={rp.image} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">{rp.name}</h3>
                  <p className="text-[#0071e3] dark:text-blue-400 font-bold text-sm mt-auto">{formatPrice(rp.price)}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}