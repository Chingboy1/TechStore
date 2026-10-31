import { CartProvider } from "./CartContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { getProducts, getCategories } from "@/lib/products";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = { title: "TechStore - Cửa hàng công nghệ", description: "Website bán đồ công nghệ" };

export default async function RootLayout({ children }) {
  const allProducts = await getProducts();
  const categories = await getCategories();
  const searchList = allProducts.map(({ id, name, price, category, brand }) => ({ id, name, price, category, brand }));

  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#f5f5f7] dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased`}>
        <CartProvider>
          <Sidebar categories={categories} /> 
          <div className="ml-[90px] flex flex-col min-h-screen">
            <Header products={searchList} /> 
            <main className="flex-grow">{children}</main>
            <Footer /> 
          </div>
          <Toaster position="bottom-right" />
        </CartProvider>
      </body>
    </html>
  );
}