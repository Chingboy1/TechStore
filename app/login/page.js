"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Flame, Skull } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";

  const safeRedirect =
    redirectUrl.startsWith("/") &&
    !redirectUrl.startsWith("//") &&
    !redirectUrl.includes("\\")
      ? redirectUrl
      : "/profile";

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [needConfirm, setNeedConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(safeRedirect);
    });
  }, [router, safeRedirect]);

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
    setNeedConfirm(false);
    setPassword("");
    setConfirmPassword("");
  };

  const sendWelcome = async (session) => {
    try {
      const response = await fetch("/api/welcome", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) {
        console.warn("Chưa xử lý được email chào mừng.");
        return;
      }
      const result = await response.json();
      if (!["accepted", "skipped"].includes(result.status)) {
        console.warn("Email chào mừng cần kiểm tra trong Make.");
      }
    } catch {
      console.warn("Chưa xác nhận được kết quả gửi email chào mừng.");
    }
  };

  const handleLogin = async () => {
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !data.session) {
      if (loginError?.message?.toLowerCase().includes("email not confirmed")) {
        setNeedConfirm(true);
        setError("Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.");
      } else {
        setError("Email hoặc mật khẩu không đúng.");
      }
      return;
    }

    await sendWelcome(data.session);
    router.push(safeRedirect);
    router.refresh();
  };

  const handleSignUp = async () => {
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("rate limit")
          ? "Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút."
          : "Không thể đăng ký. Vui lòng kiểm tra lại thông tin."
      );
      return;
    }

    if (data.user && data.user.identities?.length === 0) {
      setError("Email này đã được đăng ký. Hãy đăng nhập hoặc đặt lại mật khẩu.");
      return;
    }

    setMessage(
      "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản, sau đó quay lại đăng nhập."
    );
    setIsLogin(true);
    setPassword("");
    setConfirmPassword("");
  };

  const handleResend = async () => {
    setError("");
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (resendError) {
      setError("Chưa gửi lại được email. Vui lòng thử lại sau.");
    } else {
      setNeedConfirm(false);
      setMessage("Đã gửi lại email xác nhận.");
    }
  };

  const handleGoogle = async () => {
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${safeRedirect}` },
    });
    if (oauthError) setError("Không thể đăng nhập bằng Google.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setMessage("");
    setNeedConfirm(false);

    try {
      if (isLogin) await handleLogin();
      else await handleSignUp();
    } catch {
      setError("Không thể kết nối. Bạn vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Style kiểu DOOM =====
  const labelClass =
    "block text-xs font-bold italic uppercase tracking-[0.2em] text-gray-400 mb-2";
  const inputClass =
    "w-full bg-black/70 border border-red-950 rounded-sm px-4 py-3 text-white placeholder-gray-600 outline-none transition-all focus:border-red-600 focus:shadow-[0_0_14px_rgba(220,38,38,0.45)]";

  return (
    <div className="relative w-full max-w-md bg-[#0b0b0b] border border-red-700/70 rounded-sm p-8 shadow-[0_0_60px_rgba(220,38,38,0.25)]">
      {/* Vạch sáng đỏ phía trên */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      <Link
        href="/"
        className="text-gray-500 hover:text-red-500 flex items-center gap-2 mb-6 text-xs font-bold italic uppercase tracking-[0.2em] transition-colors"
      >
        <ArrowLeft size={14} /> Về trang chủ
      </Link>

      <div className="text-center mb-8">
        <Skull className="mx-auto text-red-600 mb-3" size={36} />
        <h1 className="text-4xl font-black italic uppercase tracking-wide text-red-600 [text-shadow:0_0_20px_rgba(220,38,38,0.6)]">
          {isLogin ? "Đăng nhập" : "Gia nhập"}
        </h1>
        <p className="mt-3 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.25em] text-gray-400">
          <span className="inline-block w-[2px] h-4 bg-red-600" />
          {isLogin ? "Trở lại địa ngục" : "Trang bị vũ khí công nghệ"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="chien-binh@doom.vn"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Mật khẩu</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLogin ? undefined : 8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="••••••••"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label htmlFor="confirm" className={labelClass}>Nhập lại mật khẩu</label>
            <input
              id="confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
        )}

        {isLogin && (
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold italic uppercase tracking-[0.15em] text-gray-500 hover:text-red-500 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="border-l-2 border-red-600 bg-red-950/30 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="border-l-2 border-green-500 bg-green-950/30 px-3 py-2 text-sm text-green-400">
            {message}
          </p>
        )}
        {needConfirm && (
          <button
            type="button"
            onClick={handleResend}
            className="text-xs font-bold italic uppercase tracking-[0.15em] text-red-500 hover:text-red-400 underline underline-offset-4"
          >
            Gửi lại email xác nhận
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 border border-red-600 bg-red-950/40 py-3.5 text-sm font-black italic uppercase tracking-[0.25em] text-red-500 transition-all hover:bg-red-600 hover:text-white hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Flame size={18} />
          {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-red-950" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">hoặc</span>
        <div className="flex-1 h-px bg-red-950" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full border border-gray-800 py-3 text-xs font-bold italic uppercase tracking-[0.2em] text-gray-300 transition-colors hover:border-red-600 hover:text-white"
      >
        Tiếp tục với Google
      </button>

      <p className="text-center text-xs uppercase tracking-[0.15em] text-gray-500 mt-8">
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <button
          type="button"
          onClick={switchMode}
          className="font-black italic text-red-500 hover:text-red-400 hover:underline underline-offset-4"
        >
          {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
        </button>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,rgba(127,29,29,0.35),transparent_65%)] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-red-600 uppercase tracking-widest text-sm">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}