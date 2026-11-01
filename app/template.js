"use client";

export default function Template({ children }) {
  return (
    // Class "animate-apple-transition" sẽ kích hoạt hiệu ứng mỗi khi chuyển trang
    <div className="animate-apple-transition">
      {children}
    </div>
  );
}