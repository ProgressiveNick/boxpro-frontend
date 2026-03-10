import type { Metadata } from "next";
import { ShowroomsContent } from "./ShowroomsContent";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Шоу-румы BoxPro | Тест-драйв упаковочного оборудования",
  description:
    "Посетите шоу-рум BoxPro на ш. Энтузиастов, 56. Тест-драйв оборудования, виртуальные экскурсии с видеоотчётом. Пн-Пт 09:00 - 18:00.",
  keywords:
    "шоу-рум, демозал, тест-драйв оборудования, упаковочное оборудование, Москва, Энтузиастов",
  openGraph: {
    title: "Шоу-румы BoxPro | Тест-драйв упаковочного оборудования",
    description:
      "Посетите шоу-рум BoxPro. Тест-драйв оборудования, виртуальные экскурсии с видеоотчётом.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function ShowroomsPage() {
  return <ShowroomsContent />;
}
