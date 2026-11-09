"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    // Supabase bắn sự kiện này khi khách bấm link khôi phục trong email
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY" && active) {
          setReady(true);
          setChecking(false);
        }
      }
    );

    // Dự phòng: nếu sau 1.5s vẫn chưa có phiên thì coi như link không hợp lệ
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setReady(true);
      } else {
        setError("Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.");
      }
      setChecking(false);
    }, 1500);

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        const msg = updateError.message.toLowerCase();
        if (msg.includes("different from the old")) {
          setError("Mật khẩu mới phải khác mật khẩu cũ.");
        } else if (msg.includes("session") || msg.includes("expired")) {
          setError("Phiên đã hết hạn. Vui lòng yêu cầu link mới.");
          setReady(false);
        } else {
          setError("Chưa đổi được mật khẩu. Vui lòng thử lại.");
        }
      } else {
        setMessage("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");
        await supabase.auth.signOut(); // bỏ phiên tạm, bắt đăng nhập lại bằng mật khẩu mới
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch {
      setError("Không thể kết nối. Bạn vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 bg-transparent text-gray-900 dark:text-white focus:border-[#0071e3] outline-none";

  return (
    <main className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tạo mật khẩu mới</h1>

        {checking && <p className="text-gray-500 text-sm">Đang kiểm tra link...</p>}

        {!checking && !ready && (
          <div className="space-y-4">
            <p role="alert" className="text-red-500 text-sm">{error}</p>
            <Link href="/forgot-password" className="block w-full text-center bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-xl transition-colors">
              Yêu cầu link mới
            </Link>
          </div>
        )}

        {!checking && ready && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nhập lại mật khẩu</label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {error && <p role="alert" className="text-red-500 text-sm">{error}</p>}
            {message && <p role="status" className="text-green-600 text-sm font-medium">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}