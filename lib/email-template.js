export function orderNotificationEmail(order, items) {
  const itemRows = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ''}${item.color ? ` - Màu: ${item.color}` : ''}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.qty).toLocaleString('vi-VN')} đ</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">🛒 Đơn hàng mới!</h1>
      <p><strong>Mã đơn:</strong> ${order.code}</p>
      <p><strong>Khách hàng:</strong> ${order.customer_name}</p>
      <p><strong>Số điện thoại:</strong> ${order.phone}</p>
      <p><strong>Địa chỉ:</strong> ${order.address}</p>
      
      <h3 style="margin-top: 30px;">Chi tiết đơn hàng:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; text-align: left;">Sản phẩm</th>
            <th style="padding: 8px; text-align: center;">SL</th>
            <th style="padding: 8px; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      
      <h2 style="color: #dc2626; text-align: right;">Tổng: ${order.total.toLocaleString('vi-VN')} đ</h2>
    </div>
  `;
}