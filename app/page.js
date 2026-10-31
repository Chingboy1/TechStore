import Link from "next/link";
import { getProducts, formatPrice } from "@/lib/products";
import ProductImage from "./ProductImage";

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    // Nền sáng là bg-white, nền tối là bg-gray-900
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <section className="text-center pt-24 pb-16 px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">TechStore.</h1>
        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">Trải nghiệm những sản phẩm công nghệ đỉnh cao nhất.</p>
        <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-full text-lg transition-colors">
          Mua sắm ngay
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold mb-10 text-center">Sản phẩm nổi bật.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProducts.map((p) => (
            <Link 
              key={p.id} 
              href={`/products/${p.id}`} 
              className="group relative bg-[#f5f5f7] dark:bg-gray-800 rounded-3xl overflow-hidden flex flex-col items-center text-center hover:scale-[1.02] transition-all duration-500 shadow-sm p-10"
            >
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">{p.brand || "Mới"}</p>
              <h3 className="text-3xl font-bold mb-2">{p.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{p.description}</p>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">{p.variants?.length > 1 ? "Từ " : ""}{formatPrice(p.price)}</p>
              <div className="w-full h-72 mt-4 relative">
                 <ProductImage id={p.id} category={p.category} name={p.name} imageSrc={p.image} className="w-full h-full object-contain p-4" />
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/products" className="text-blue-600 dark:text-blue-400 font-medium text-lg hover:underline">Xem tất cả sản phẩm &rarr;</Link>
        </div>
      </section>
    </main>
  );
}