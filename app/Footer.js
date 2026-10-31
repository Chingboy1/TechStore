import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto pt-10 pb-6 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">TechStore.</h3>
          <p>Hệ thống bán lẻ thiết bị công nghệ chính hãng. Trải nghiệm mua sắm tuyệt vời, bảo hành uy tín.</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Chính sách</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Chính sách bảo hành</Link></li>
            <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Chính sách đổi trả</Link></li>
            <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Chính sách vận chuyển</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Liên hệ</h3>
          <p className="mb-1">📍 Địa chỉ: 123 Đường Công Nghệ, TP.HCM</p>
          <p className="mb-1">📞 Hotline: 1900 1234</p>
          <p>✉️ Email: cskh@techstore.vn</p>
        </div>
      </div>
      <div className="text-center border-t border-gray-200 dark:border-gray-800 pt-6 text-gray-500 dark:text-gray-500">
        © 2024 TechStore. Thiết kế bởi Sinh Viên.
      </div>
    </footer>
  );
}