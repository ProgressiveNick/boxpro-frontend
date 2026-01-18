export type TabKey = "compare" | "reviews" | "questions" | "reliability";

export type TabData = {
  label: string;
  icon?: React.ReactNode;
  iconPath?: string;
  tooltip?: string;
  onClick?: () => void;
  isClickable?: boolean;
};

export const TABS_MAP: Record<TabKey, TabData> = {
  compare: {
    label: "Сравнить",
    iconPath: "/img/srav.svg",
    tooltip: "Сравнить товар с другими",
    isClickable: true,
  },
  reviews: {
    label: "Отзывы",
    iconPath: "/icons/shop.svg",
    tooltip: "Посмотреть отзывы о товаре",
    isClickable: true,
  },
  questions: {
    label: "Задать вопрос",
    iconPath: "/img/Question.svg",
    tooltip: "Задать вопрос о товаре",
    isClickable: true,
  },
  reliability: {
    label: "Отличная надежность",
    iconPath: "/icons/shop.svg",
    tooltip: "Информация о надежности товара",
    isClickable: false,
  },
};
