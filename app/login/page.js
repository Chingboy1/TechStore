"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

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
  try {
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !data.session) {
      setError(
        "Đăng nhập chưa thành công. Kiểm tra email, mật khẩu và xác nhận email."
      );
    } else {
      // API welcome kiểm tra bảng để tránh gửi thư trùng.
      // Lỗi gửi thư không ngăn khách đăng nhập.
      try {
        const response = await fetch("/api/welcome", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
          signal: AbortSignal.timeout(12000),
        });

        if (!response.ok) {
          console.warn("Chưa xử lý được email chào mừng.");
        } else {
          const result = await response.json();

          if (!["accepted", "skipped"].includes(result.status)) {
            console.warn("Email chào mừng cần kiểm tra trong Make.");
          }
        }
      } catch {
        console.warn("Chưa xác nhận được kết quả gửi email chào mừng.");
      }

      // Chỉ cho chuyển hướng đến đường dẫn trong website.
      const safeRedirect =
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("//") &&
        !redirectUrl.includes("\\")
          ? redirectUrl
          : "/profile";

      router.push(safeRedirect);
      router.refresh();
    }
  } catch {
    setError("Không thể kết nối. Bạn vui lòng thử lại.");
  }
}
     else {
  alert(
    "Vui lòng kiểm tra email để xác nhận tài khoản, sau đó quay lại website đăng nhập."
  );
  setIsLogin(true);
  setPassword("");
}
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
      <Link href="/" className="text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-2 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Về trang chủ
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        {isLogin ? "Login" : "Đăng ký"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}

// Bọc trong Suspense để tránh lỗi build của Next.js khi dùng useSearchParams
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex items-center justify-center p-4 transition-colors duration-300">
      <Suspense fallback={<div className="text-gray-500">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}