import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#0a0a0a] text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Ôi không! Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link href="/" className="bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium px-8 py-3 rounded-full transition-colors">
        Về lại Trang chủ
      </Link>
    </div>
  );
}