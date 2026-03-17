"use client";

import dynamic from "next/dynamic";

const GoogleAnalytics = dynamic(() => import("./GoogleAnalytics"), {
  ssr: false,
});

export default function GoogleAnalyticsWrapper() {
  return process.env.NODE_ENV === "production" ? <GoogleAnalytics /> : null;
}

