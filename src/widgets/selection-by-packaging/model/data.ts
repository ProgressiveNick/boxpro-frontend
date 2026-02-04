import { PackagingGroup, PackagingTab } from "./types";

// Статические данные для виджета
export const packagingGroups: PackagingGroup[] = [
  {
    id: 1,
    title: "Пакеты из рулонной плёнки (формируются машиной)",
    cards: [
      {
        id: 1,
        title: "Flow-Pack",
        description: "Флоупак, 3-шовный пакет",
        imagePath: "/img/widgets/selection-by-packaging/1.png",
        link: "/catalog/upakovochnoe-oborudovanie/gorizontal-nye-upakovochnye-mashiny",
      },
      {
        id: 2,
        title: "Вертикальный пакет «подушка»",
        description: "3-шовный пакет (сыпучие/штучные)",
        imagePath: "/img/widgets/selection-by-packaging/2.png",
        link: "/catalog/fasovochno-upakovochnoe-oborudovanie",
      },
      {
        id: 3,
        title: "Саше",
        description: "Мини-пакет для жидких и пастообразных продуктов",
        imagePath: "/img/widgets/selection-by-packaging/3.png",
        link: "/catalog/fasovochno-upakovochnoe-oborudovanie/dozatory-dlya-zhidkosti-porshnevye",
      },
    ],
  },
  {
    id: 2,
    title: "Готовый пакет (ПЭ, ПП, комбинированный)",
    cards: [
      {
        id: 4,
        title: "Простой пакет с запайкой края",
        description: "Без формования пакета машиной",
        imagePath: "/packs_types/2-1.png",
        link: "/catalog",
      },
      {
        id: 5,
        title: "Готовый пакет",
        description: "Готовый пакет с дозированием сыпучих продуктов",
        imagePath: "/packs_types/2-2.png",
        link: "/catalog",
      },
      {
        id: 6,
        title: "Doy-Pack ",
        description: "Дой-пак, в т.ч. с zip-lock",
        imagePath: "/packs_types/2-3.png",
        link: "/catalog",
      },
    ],
  },
  {
    id: 3,
    title: "Вакуум / газовая среда",
    cards: [
      {
        id: 7,
        title: "Вакуум в пакете ",
        description: "Гладкий или рифлёный пакет",
        imagePath: "/packs_types/3-1.png",
        link: "/catalog/vakuumnye-upakovschiki",
      },
      {
        id: 8,
        title: "Вакуум / газонаполнение в лотке ",
        description: "MAP-упаковка",
        imagePath: "/packs_types/3-2.png",
        link: "/catalog/vakuumnye-upakovschiki",
      },
      {
        id: 9,
        title: "Вакуум + усадка пакета",
        description: "Вакуумная упаковка с усадкой пакета",
        imagePath: "/packs_types/3-3.png",
        link: "/catalog/vakuumnye-upakovschiki",
      },
    ],
  },
  {
    id: 4,
    title: "Skin, термоформер, термоусадка",
    cards: [
      {
        id: 10,
        title: "Skin-упаковка ",
        description: "Пищевые продукты",
        imagePath: "/packs_types/4-1.png",
        link: "/catalog/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie/pischevye-skin-upakovochnye-mashiny",
      },
      {
        id: 11,
        title: "Skin-упаковка ",
        description: "Непищевые товары",
        imagePath: "/packs_types/4-2.png",
        link: "/catalog/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie/pischevye-skin-upakovochnye-mashiny",
      },
      {
        id: 12,
        title: "Термоформер ",
        description: "Жёсткая форма + вакуум/газ",
        imagePath: "/packs_types/4-3.png",
        link: "/catalog/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie/termoformery",
      },
      {
        id: 13,
        title: "Термоусадка одиночных изделий в ПОФ/ПЭ плёнку",
        description: "Одиночные изделия в ПОФ/ПЭ плёнку",
        imagePath: "/packs_types/4-4.png",
        link: "/catalog/termousadochnye-apparaty",
      },
      {
        id: 14,
        title: "Термоусадка групповой упаковки ",
        description: "Групповая упаковка (наборы, блоки, лотки)",
        imagePath: "/packs_types/4-5.png",
        link: "/catalog/termousadochnye-apparaty",
      },
    ],
  },
  {
    id: 5,
    title: "Транспортная / складская упаковка",
    cards: [
      {
        id: 15,
        title: "Паллеты в стретч-плёнку",
        description: "Стретч-плёнка",
        imagePath: "/packs_types/5-1.png",
        link: "/catalog/palletoupakovschiki-palletoobmotchiki",
      },
      {
        id: 16,
        title: "Крупные короба/лотки в стретч-плёнку",
        description: "Стретч-плёнка",
        imagePath: "/packs_types/5-2.png",
        link: "/catalog/palletoupakovschiki-palletoobmotchiki",
      },
      {
        id: 17,
        title: "Транспортная упаковка в короба + лента",
        description: "Короба + лента",
        imagePath: "/packs_types/5-3.png",
        link: "/catalog/palletoupakovschiki-palletoobmotchiki",
      },
      {
        id: 18,
        title: "Мешок с зашивкой",
        description: "Крупа, комбикорм, стройматериалы",
        imagePath: "/packs_types/5-4.png",
        link: "/catalog/palletoupakovschiki-palletoobmotchiki",
      },
    ],
  },
];

// Табы для переключения групп
export const packagingTabs: PackagingTab[] = [
  { id: 1, label: "Пакеты из рулонной плёнки", groupId: 1 },
  { id: 2, label: "Готовый пакет", groupId: 2 },
  { id: 3, label: "Вакуум / газовая среда", groupId: 3 },
  { id: 4, label: "Skin, термоформер, термоусадка", groupId: 4 },
  { id: 5, label: "Транспортная / складская упаковка", groupId: 5 },
];
