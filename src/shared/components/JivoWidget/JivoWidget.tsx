"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const EXCLUDED_PATH_PREFIXES = ["/cart", "/order"];

export function JivoWidget() {
  const pathname = usePathname();

  if (process.env.NODE_ENV !== "production") return null;
  if (!pathname) return null;

  const isExcluded = EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isExcluded) return null;

  return (
    <Script
      id="jivo-widget"
      src="https://code.jivo.ru/widget/cNhXPM7OZo"
      strategy="afterInteractive"
    />
  );
}

