import { CartProvider } from "./CartContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer"; 
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { getProducts, getCategories } from "@/lib/products";
import "./globals.css"; // Phải có dòng này ở đầu file

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "Doom - Cửa hàng công nghệ",
  description: "Website bán đồ công nghệ tích hợp chatbot",
};

export default async function RootLayout({ children }) {
  // Lấy dữ liệu từ Supabase để truyền cho Header (tìm kiếm) và Sidebar (danh mục)
  const allProducts = await getProducts();
    const allCategories = await getCategories();
  // Lọc bỏ danh mục "PC theo ngành"
  const categories = allCategories.filter((c) => c.slug !== "pc-theo-nganh");
  
  // Chỉ lấy các trường cần thiết cho thanh tìm kiếm để tối ưu hiệu năng
  const searchList = allProducts.map(({ id, name, price, category, brand }) => ({
    id, name, price, category, brand,
  }));

  return (
    <html lang="vi">
      {/* 
        - bg-[#f5f5f7]: Màu nền xám sáng (Light Mode)
        - dark:bg-[#0a0a0a]: Màu đen bóng tuyền (Dark Mode) 
        - transition-colors: Hiệu ứng chuyển màu mượt mà
      */}
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-100 antialiased transition-colors duration-300`}>
        
        <CartProvider>
          {/* Sidebar (Thanh menu lơ lửng bên trái) */}
          <Sidebar categories={categories} /> 
          
          {/* Vùng chứa nội dung chính (Đẩy sang phải 90px để tránh đè lên Sidebar) */}
          <div className="ml-[90px] flex flex-col min-h-screen">
            
            <Header products={searchList} /> 
            
            <main className="flex-grow">
              {children}
            </main>
            
            <Footer /> 
          </div>

          {/* Thông báo Toast (Hiện ở góc dưới bên phải) */}
          <Toaster position="bottom-right" />
        </CartProvider>
        
      </body>
    </html>
  );
}