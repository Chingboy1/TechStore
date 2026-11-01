export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#0a0a0a]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0071e3] rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
    </div>
  );
}