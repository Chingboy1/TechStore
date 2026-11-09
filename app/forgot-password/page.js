"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (loading || cooldown > 0) return;
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );

      if (resetError) {
        setError(
          resetError.message.toLowerCase().includes("rate limit")
            ? "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút."
            : "Chưa gửi được email. Vui lòng thử lại."
        );
      } else {
        setMessage(
          "Nếu email này đã đăng ký, bạn sẽ nhận được link đổi mật khẩu trong ít phút (kiểm tra cả mục Spam)."
        );
        setCooldown(60);
      }
    } catch {
      setError("Không thể kết nối. Bạn vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <Link href="/login" className="text-gray-500 hover:text-black dark:hover:text-white flex items-center gap-2 mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quên mật khẩu</h1>
        <p className="text-gray-500 mb-6 text-sm">Nhập email đăng ký của bạn, chúng tôi sẽ gửi link để đặt lại mật khẩu.</p>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Nhập email của bạn"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:border-[#0071e3] outline-none"
            />
          </div>

          {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
          {message && <p role="status" className="text-green-600 text-sm font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading
              ? "Đang gửi..."
              : cooldown > 0
              ? `Gửi lại sau ${cooldown}s`
              : "Gửi link đổi mật khẩu"}
          </button>
        </form>
      </div>
    </main>
  );
}