"use client";

import dynamic from "next/dynamic";

const YandexMetrika = dynamic(
  () => import("./YandexMetrika"),
  {
    ssr: false,
  }
);

export default function YandexMetrikaWrapper() {
  return process.env.NODE_ENV === "production" ? <YandexMetrika /> : null;
}
