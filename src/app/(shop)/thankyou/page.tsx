import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Спасибо за заявку | BoxPro - упаковочное оборудование",
  description:
    "Спасибо за вашу заявку! Наши специалисты свяжутся с вами в ближайшее время для консультации по упаковочному оборудованию.",
  keywords: "заявка принята, спасибо, консультация, упаковочное оборудование",
  openGraph: {
    title: "Спасибо за заявку | BoxPro",
    description:
      "Спасибо за вашу заявку! Наши специалисты свяжутся с вами в ближайшее время.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function ThankYouPage() {
  return <div>СПАСИБО ЗА ЗАЯВКУ!</div>;
}
