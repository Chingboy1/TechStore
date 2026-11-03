"use client";
import { useEffect } from "react";

const INJECT = "https://cdn.botpress.cloud/webchat/v3.7/inject.js";
const CONFIG = "https://files.bpcontent.cloud/2026/10/22/09/20261022095005-MVU5GTED.js";

export default function BotpressChat() {
  useEffect(() => {
    // Tránh nhúng hai lần (chế độ dev của React chạy hiệu ứng hai lần)
    if (document.querySelector(`script[src="${INJECT}"]`)) return;

    const inject = document.createElement("script");
    inject.src = INJECT;
    inject.onload = () => {
      const config = document.createElement("script");
      config.src = CONFIG;
      config.defer = true;
      document.body.appendChild(config);
    };
    document.body.appendChild(inject);
  }, []);

  return null;
}