import { notFound } from "next/navigation";
import { getProduct, formatPrice } from "@/lib/products";
import Link from "next/link";
import AddToCart from "../../AddToCart";
import ProductImage from "../../ProductImage";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const p = await getProduct(id);
  
  if (!p) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-8 py-10 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      
      {/* Breadcrumb tối giản */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-8 space-x-2">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-gray-900 dark:hover:text-white">Sản phẩm</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{p.name}</span>
      </nav>
      
      {/* KHỐI TRÊN: ẢNH & THÔNG TIN (Giống Apple) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start mb-20">
        
        {/* Cột trái: Hình ảnh (Ghim cố định khi cuộn nếu cần, nhưng ở đây để tự nhiên) */}
        <div className="sticky top-24 bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px]">
          <ProductImage 
            id={p.id} 
            category={p.category} 
            name={p.name} 
            imageSrc={p.image} 
            className="w-full h-full max-h-[500px] object-contain mix-blend-multiply dark:mix-blend-normal" 
          />
        </div>

        {/* Cột phải: Thông tin mua hàng */}
        <div className="flex flex-col pt-4">
          {p.brand && <p className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-2">Mới</p>}
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-gray-900 dark:text-white leading-tight tracking-tight">
            {p.name}
          </h1>
          <p className="text-2xl font-normal text-gray-900 dark:text-gray-100 mb-8">
            {formatPrice(p.price)}
          </p>
          
          {/* Component chọn Màu sắc & Phiên bản (Nằm trong AddToCart) */}
          <div className="mb-10">
            <AddToCart product={{ id: p.id, name: p.name, price: p.price, variants: p.variants, colors: p.colors }} />
          </div>

          {/* Ưu đãi / Giao hàng */}
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
      </div>

      {/* KHỐI DƯỚI: THÔNG TIN CHI TIẾT (Cuộn xuống) */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-16 space-y-16">
        
        {/* Mô tả sản phẩm */}
        {p.description && (
          <section className="max-w-3xl">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white tracking-tight">Tổng quan</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-light">
              {p.description}
            </p>
          </section>
        )}

        {/* Bảng thông số kỹ thuật (Không viền, tối giản) */}
        {p.specs && p.specs.length > 0 && (
          <section>
            <h2 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white tracking-tight">Thông số kỹ thuật</h2>
            <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {p.specs.map((spec, index) => (
                <div key={index} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{spec.label}</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ưu nhược điểm */}
        {(p.pros || p.cons) && (
          <section className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {p.pros && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Ưu điểm
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">{p.pros}</p>
              </div>
            )}
            {p.cons && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-red-500">✕</span> Nhược điểm
                </h3>
                <p className="text-gray-700 dark:text-gray-300 font-light leading-relaxed">{p.cons}</p>
              </div>
            )}
          </section>
        )}

      </div>
    </main>
  );
}