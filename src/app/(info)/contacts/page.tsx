import type { Metadata } from "next";
import { ContactsBlock } from "@/widgets/contacts-block";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Контакты BoxPro - упаковочное оборудование | Связаться с нами",
  description:
    "Свяжитесь с BoxPro для покупки упаковочного оборудования. Телефон: 8 (926) 519-88-08, адрес: Москва, пл. Новая, д. 8. Работаем по всей России.",
  keywords:
    "контакты BoxPro, упаковочное оборудование, телефон, адрес, связаться с нами",
  openGraph: {
    title: "Контакты BoxPro - упаковочное оборудование",
    description:
      "Свяжитесь с BoxPro для покупки упаковочного оборудования. Телефон: 8 (926) 519-88-08.",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function ContactsPage() {
  return <ContactsBlock />;
}
