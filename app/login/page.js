"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      // Đăng nhập
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Sai email hoặc mật khẩu. Vui lòng thử lại!");
      else {
        router.push("/profile");
        router.refresh();
      }
    } else {
      // Đăng ký
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else alert("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        
        <Link href="/" className="text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-2 mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Về trang chủ
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {isLogin ? "Login" : "Đăng ký"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ô EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="Nhập email của bạn"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:border-[#0071e3] outline-none transition-colors" 
            />
          </div>

          {/* Ô MẬT KHẨU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Nhập mật khẩu"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:border-[#0071e3] outline-none transition-colors" 
            />
          </div>

          {/* LINK QUÊN MẬT KHẨU (Chỉ hiện khi Đăng nhập) */}
          {isLogin && (
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-[#0071e3] hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Đang xử lý..." : (isLogin ? "Login" : "Đăng ký")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-[#0071e3] font-bold hover:underline">
            {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
          </button>
        </p>
      </div>
    </main>
  );
}