"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Thêm tham số color vào hàm addItem
  const addItem = (product, variant, color) => {
    const key = `${product.id}|${variant?.label || 'default'}|${color || 'default'}`;
    const price = variant ? variant.price : product.price;
    
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        { key, id: product.id, name: product.name, label: variant?.label, color, price, qty: 1 },
      ];
    });
  };

  const changeQty = (key, delta) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, changeQty, removeItem, clear, count, total, isMenuOpen, setIsMenuOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);