import { CartProvider } from "./CartContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { getProducts, getCategories } from "@/lib/products";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "DOOM - Cửa hàng công nghệ",
  description: "Website bán đồ công nghệ tích hợp chatbot",
};

export default async function RootLayout({ children }) {
  const allProducts = await getProducts();
  const rawCategories = await getCategories();
  
  const categories = rawCategories.filter((c) => c.slug !== "pc-theo-nganh");
  
  const searchList = allProducts.map(({ id, name, price, category, brand }) => ({
    id, name, price, category, brand,
  }));

  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-100 antialiased transition-colors duration-300`}>
        
        <CartProvider>
          <Sidebar categories={categories} /> 
          
          {/* Đẩy nội dung sang phải 70px trên màn hình lớn (md) để chừa chỗ cho Sidebar */}
          <div className="ml-0 md:ml-[70px] flex flex-col min-h-screen transition-all duration-300">
            
            <Header products={searchList} /> 
            
            <main className="flex-grow">
              {children}
            </main>
            
            <Footer /> 
          </div>

          <Toaster position="bottom-right" />
        </CartProvider>
        
      </body>
    </html>
  );
}