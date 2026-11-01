"use client";
import { motion } from "framer-motion";

export default function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      // Bắt đầu với độ mờ = 0 và trượt xuống 30px
      initial={{ opacity: 0, y: 30 }}
      // Khi cuộn tới (whileInView), trượt về vị trí cũ và hiện rõ lên
      whileInView={{ opacity: 1, y: 0 }}
      // Chỉ chạy hiệu ứng 1 lần (once: true)
      viewport={{ once: true, margin: "-50px" }}
      // Thời gian chạy 0.7 giây, hiệu ứng làm mượt (ease-out)
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}