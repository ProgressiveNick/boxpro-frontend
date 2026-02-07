import type { Metadata } from "next";

// Валидация переменных окружения в самом начале загрузки приложения
// CI/CD: автоматический деплой при коммитах в main
import "@/shared/lib/env-validation/init";

import "@/shared/styles/globals.css";
import "@/shared/styles/header.css";
import "@/shared/styles/footer.css";
import { ScrollToTop } from "@/shared/components/ScrollToTop/ScrollToTop";
import { TestFormModal } from "@/widgets/test-form";
import { ConsultationFormModal } from "@/widgets/consultation-form";
import {
  OrganizationJsonLd,
  WebsiteJsonLd,
} from "@/shared/components/JsonLd/JsonLd";
import { LayoutProvider } from "@/widgets/layout-provider";
import YandexMetrikaWrapper from "@/shared/components/YandexMetrikaWrapper";

export const metadata: Metadata = {
  title: {
    default: "BoxPro - упаковочное и производственное оборудование",
    template: "%s | BoxPro",
  },
  description:
    "Корпоративный сайт с большим каталогом товаров и услугами по обслуживанию и ремонту оборудования",
  keywords:
    "упаковочное оборудование, производственное оборудование, фасовка, упаковка, ремонт оборудования, обслуживание оборудования, BoxPro",
  authors: [{ name: "BoxPro" }],
  creator: "BoxPro",
  publisher: "BoxPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://boxpro.moscow"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://boxpro.moscow",
    siteName: "BoxPro",
    title: "BoxPro - упаковочное и производственное оборудование",
    description:
      "Корпоративный сайт с большим каталогом товаров и услугами по обслуживанию и ремонту оборудования",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "BoxPro - упаковочное оборудование",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoxPro - упаковочное и производственное оборудование",
    description:
      "Корпоративный сайт с большим каталогом товаров и услугами по обслуживанию и ремонту оборудования",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "your-google-verification-code",
    yandex: "c1324046f8eedb81", // Замените на реальный код
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body>
        <ScrollToTop />
        <LayoutProvider>{children}</LayoutProvider>
        <TestFormModal />
        <ConsultationFormModal />
        <YandexMetrikaWrapper />
      </body>
    </html>
  );
}
