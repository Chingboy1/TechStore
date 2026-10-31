export const formatPrice = (p) =>
  p == null ? "Liên hệ" : p.toLocaleString("vi-VN") + " đ";