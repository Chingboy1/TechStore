"use client";
import Lottie from "lottie-react";
import bannerData from "./assets/banner.json"; // Trỏ tới file json vừa tạo

export default function LottieBanner() {
  return (
    <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none opacity-30 dark:opacity-40">
      <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px]">
        <Lottie animationData={bannerData} loop={true} />
      </div>
    </div>
  );
}