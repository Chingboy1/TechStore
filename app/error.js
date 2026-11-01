"use client";

export default function Error({ reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#0a0a0a] text-center px-4">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Đã xảy ra lỗi!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        Hệ thống gặp sự cố khi tải dữ liệu. Vui lòng thử lại sau.
      </p>
      <button onClick={() => reset()} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium px-8 py-3 rounded-full transition-colors">
        Thử lại
      </button>
    </div>
  );
}