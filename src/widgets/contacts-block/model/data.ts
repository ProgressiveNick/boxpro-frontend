export interface ContactCard {
  type: "phone" | "mail" | "address" | "time";
  label: string;
  value: string;
  href?: string;
}

export const contactCards: ContactCard[] = [
  {
    type: "phone",
    label: "Телефон",
    value: "8(800)444-47-53",
    href: "tel:+78004444753",
  },
  {
    type: "mail",
    label: "Почта",
    value: "mail@boxpro.moscow",
    href: "mailto:mail@boxpro.moscow",
  },
  {
    type: "address",
    label: "Адрес",
    value:
      "г.Москва, Муниципальный округ Тверской, пл. Новая, д. 8, стр. 2, помещ. ¼",
  },
  {
    type: "time",
    label: "Время работы",
    value: "Пн-Пт: 10:00 - 20:00 | Сб-Вс: Выходной",
  },
];

export const contactsData = {
  title: "Свяжитесь с нами или приходите в наш в офис",
  description:
    "Хотите обсудить проект, получить консультацию или узнать больше о наших услугах? Свяжитесь с нами онлайн или лично — мы предложим лучшие решения для вашего бизнеса.",
};
