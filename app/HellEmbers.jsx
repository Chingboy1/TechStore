"use client";
import { useEffect, useState } from "react";

export default function HellEmbers() {
  const [embers, setEmbers] = useState([]);

  useEffect(() => {
    // Tạo 30 hạt lửa ngẫu nhiên
    const newEmbers = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 5 + 5}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.random() * 4 + 2}px`,
    }));
    setEmbers(newEmbers);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden mix-blend-screen">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-[-10px] bg-orange-500 rounded-full blur-[1px] opacity-0 animate-ember"
          style={{
            left: ember.left,
            width: ember.size,
            height: ember.size,
            animationDuration: ember.animationDuration,
            animationDelay: ember.animationDelay,
            boxShadow: "0 0 10px 2px rgba(239, 68, 68, 0.8)",
          }}
        />
      ))}
    </div>
  );
}