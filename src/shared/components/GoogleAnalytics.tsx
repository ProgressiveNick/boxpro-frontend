"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: any[]) => void;
  }
}

function pageview(gaId: string, url: string) {
  if (!window.gtag) return;
  window.gtag("config", gaId, {
    page_path: url,
  });
}

const GA_MEASUREMENT_ID = "G-6K6NGSK1VB";

export default function GoogleAnalytics() {
  const gaId = GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (url) pageview(gaId, url);
  }, [gaId, pathname, searchParams]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          gaId,
        )}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

