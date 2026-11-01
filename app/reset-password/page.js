"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase tự động bắt token từ URL khi khách click vào link trong email
    // và tạo một phiên đăng nhập tạm thời để cho phép đổi mật khẩu.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Link đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.");
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Cập nhật mật khẩu mới
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => router.push("/login"), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tạo mật khẩu mới</h1>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:border-[#0071e3] outline-none" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
          </button>
        </form>
      </div>
    </main>
  );
}