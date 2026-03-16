/**
 * Хардкод-данные для блока «Разделы каталога» на главной.
 * Картинки, ссылки и подкатегории можно заполнить нужными значениями позже.
 */
export type CatalogSectionSubcategory = {
  name: string;
  url: string;
};

export type CatalogSectionItem = {
  name: string;
  url: string;
  imgSrc?: string;
  subcategories: CatalogSectionSubcategory[];
};

export const catalogSectionsData: CatalogSectionItem[] = [
  {
    name: "Оборудование для обработки и переработки",
    url: "/catalog/oborudovanie-dlya-obrabotki-i-pererabotki",
    imgSrc: "/img/catalogRazdels/obrabotka.png",
    subcategories: [
      {
        name: "Для теста",
        url: "/catalog/oborudovanie-dlya-obrabotki-i-pererabotki/obrabotka-testa",
      },
      {
        name: "Для мяса и рыбы",
        url: "/catalog/oborudovanie-dlya-obrabotki-i-pererabotki/myasopererabatyvayuschee-oborudovanie",
      },
      {
        name: "Термообработка",
        url: "/catalog/oborudovanie-dlya-obrabotki-i-pererabotki/termoobrabotka",
      },
      {
        name: "Прочее",
        url: "/catalog/oborudovanie-dlya-obrabotki-i-pererabotki/prochee-obrabatyvayushhee-oborudovanie",
      },
    ],
  },
  {
    name: "Упаковочное оборудование",
    url: "/catalog/upakovochnoe-oborudovanie",
    imgSrc: "/img/catalogRazdels/upack.png",
    subcategories: [
      {
        name: "Горизонтальные упаковочные машины",
        url: "/catalog/upakovochnoe-oborudovanie/gorizontal-nye-upakovochnye-mashiny",
      },
      {
        name: "Вакуумные упаковщики ",
        url: "/catalog/upakovochnoe-oborudovanie/vakuumnye-upakovschiki",
      },
      {
        name: "Запайщики пакетов",
        url: "/catalog/upakovochnoe-oborudovanie/zapayschiki-paketov",
      },
      {
        name: "Термоусадочное",
        url: "/catalog/upakovochnoe-oborudovanie/termousadochnye-apparaty",
      },
    ],
  },
  {
    name: "Фасовочное оборудование",
    url: "/catalog/fasovochno-upakovochnoe-oborudovanie",
    imgSrc: "/img/catalogRazdels/fasovan.png",
    subcategories: [
      {
        name: "Вертикальные упаковочные базы",
        url: "/catalog/fasovochno-upakovochnoe-oborudovanie/vertikal-nye-upakovochnye-bazy",
      },
      {
        name: "Дозаторы для жидкости",
        url: "/catalog/fasovochno-upakovochnoe-oborudovanie/dozatory-dlya-zhidkosti-porshnevye",
      },
      {
        name: "Дозаторы для сыпучих продуктов",
        url: "/catalog/fasovochno-upakovochnoe-oborudovanie/dozatory-sypuchih-trudnosypuchih-produktov",
      },
    ],
  },
  {
    name: "Оборудование HORECA",
    url: "/catalog/oborudovanie-horeca",
    imgSrc: "/img/catalogRazdels/horeca.png",
    subcategories: [
      {
        name: "Слайсеры",
        url: "/catalog/oborudovanie-horeca/gastronomicheskie-slaysery",
      },
      {
        name: "Фритюрницы",
        url: "/catalog/oborudovanie-horeca/frityurnitsy",
      },
      {
        name: "Мармиты",
        url: "/catalog/oborudovanie-horeca/marmity",
      },
    ],
  },
  {
    name: "Оборудование для маркетплейсов",
    url: "/catalog/palletoupakovschiki-palletoobmotchiki/roboty-palletayzery",
    imgSrc: "/img/catalogRazdels/marketplace.png",
    subcategories: [
      {
        name: "Запайщики лотков",
        url: "/catalog/upakovochnoe-oborudovanie/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie",
      },
      {
        name: "Роботы паллетайзеры",
        url: "/catalog/palletoupakovschiki-palletoobmotchiki/roboty-palletayzery",
      },
      {
        name: "Термоусадочное оборудование",
        url: "/catalog/upakovochnoe-oborudovanie/termousadochnye-apparaty",
      },
      {
        name: "Картонажное оборудование",
        url: "/catalog/upakovochnoe-oborudovanie/kartonazhnoe-oborudovanie",
      },
    ],
  },
  {
    name: "Паллетоупаковщики",
    url: "/catalog/palletoupakovschiki-palletoobmotchiki",
    imgSrc: "/img/catalogRazdels/pallet.png",
    subcategories: [
      {
        name: "Мобильные ",
        url: "/catalog/palletoupakovschiki-palletoobmotchiki/mobil-nye-palletoupakovschiki",
      },
      {
        name: "C престрейчем",
        url: "/catalog/palletoupakovschiki-palletoobmotchiki/palletoupakovschiki-s-prestreychem",
      },
      {
        name: "C механическим натяжением",
        url: "/catalog/palletoupakovschiki-palletoobmotchiki/palletoupakovschiki-s-mehanicheskim-natyazheniem",
      },
      {
        name: "Роботы паллетайзеры",
        url: "/catalog/palletoupakovschiki-palletoobmotchiki/roboty-palletayzery",
      },
    ],
  },
  {
    name: "Запчасти и детали",
    url: "/catalog/zapasnye-chasti-i-rashodnye-materialy",
    imgSrc: "/img/catalogRazdels/zapchasty.png",
    subcategories: [
      {
        name: "Для упаковочного ",
        url: "/catalog/zapasnye-chasti-i-rashodnye-materialy/dlya-gorizontal-nogo-oborudovaniya",
      },
      {
        name: "Для фасовочного ",
        url: "/catalog/zapasnye-chasti-i-rashodnye-materialy/dlya-porshnevyh-dozatorov",
      },
      {
        name: "Для термоусадочного ",
        url: "/catalog/zapasnye-chasti-i-rashodnye-materialy/dlya-termousadochnogo-oborudovaniya",
      },
      {
        name: "Для вакуумного ",
        url: "/catalog/zapasnye-chasti-i-rashodnye-materialy/dlya-vakuumnogo-obrudovaniya",
      },
    ],
  },
  {
    name: "Упаковочные материалы",
    url: "/catalog/upakovochnye-materialy",
    imgSrc: "/img/catalogRazdels/matheryals.png",
    subcategories: [
      {
        name: "Пленка для скин машин",
        url: "/catalog/upakovochnye-materialy/plenka-dlya-skin-upakovochnyh-mashin",
      },
      {
        name: "Стрейч пленка",
        url: "/catalog/upakovochnye-materialy/streych-plenka",
      },
      {
        name: "Термоусадочная пленка",
        url: "/catalog/upakovochnye-materialy/termousadochnaya-plenka-pof",
      },
    ],
  },
  {
    name: "Сервисный центр",
    url: "/services",
    imgSrc: "/img/services.png",
    subcategories: [
      { name: "Выездная диагностика", url: "/services/field-diagnostics" },
      { name: "Ремонт", url: "/services/remont" },
      { name: "Обслуживание", url: "/services/obsluzhivanie" },
    ],
  },
];
