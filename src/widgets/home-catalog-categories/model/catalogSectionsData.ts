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
      { name: "Для теста", url: "/catalog/dlya-testa" },
      { name: "Для мяса и рыбы", url: "/catalog/dlya-myasa-i-ryby" },
      { name: "Термообработка", url: "/catalog/termoobrabotka" },
      { name: "Прочее", url: "/catalog/prochee" },
    ],
  },
  {
    name: "Упаковочное оборудование",
    url: "/catalog/upakovochnoe-oborudovanie",
    imgSrc: "/img/catalogRazdels/upack.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/upakovochnoe/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/upakovochnoe/podkategoria-2" },
      { name: "Подкатегория 3", url: "/catalog/upakovochnoe/podkategoria-3" },
    ],
  },
  {
    name: "Фасовочное оборудование",
    url: "/catalog/fasovochnoe-oborudovanie",
    imgSrc: "/img/catalogRazdels/fasovan.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/fasovochnoe/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/fasovochnoe/podkategoria-2" },
    ],
  },
  {
    name: "Оборудование HORECA",
    url: "/catalog/oborudovanie-horeca",
    imgSrc: "/img/catalogRazdels/horeca.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/horeca/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/horeca/podkategoria-2" },
    ],
  },
  {
    name: "Оборудование для маркетплейсов",
    url: "/catalog/oborudovanie-dlya-marketpleysov",
    imgSrc: "/img/catalogRazdels/marketplace.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/marketpleysy/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/marketpleysy/podkategoria-2" },
    ],
  },
  {
    name: "Паллетоупаковщики",
    url: "/catalog/palletoupakovshchiki",
    imgSrc: "/img/pallet.png",
    subcategories: [
      {
        name: "Подкатегория 1",
        url: "/catalog/palletoupakovshchiki/podkategoria-1",
      },
      {
        name: "Подкатегория 2",
        url: "/catalog/palletoupakovshchiki/podkategoria-2",
      },
    ],
  },
  {
    name: "Запчасти и детали",
    url: "/catalog/zapchasti-i-detali",
    imgSrc: "/img/rasshodnye.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/zapchasti/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/zapchasti/podkategoria-2" },
    ],
  },
  {
    name: "Упаковочные материалы",
    url: "/catalog/upakovochnye-materialy",
    imgSrc: "/img/materialy.png",
    subcategories: [
      { name: "Подкатегория 1", url: "/catalog/materialy/podkategoria-1" },
      { name: "Подкатегория 2", url: "/catalog/materialy/podkategoria-2" },
    ],
  },
  {
    name: "Сервисный центр",
    url: "/services/remont",
    imgSrc: "/img/services.png",
    subcategories: [
      { name: "Выездная диагностика", url: "/services/field-diagnostics" },
      { name: "Ремонт", url: "/services/remont" },
      { name: "Обслуживание", url: "/services/obsluzhivanie" },
    ],
  },
];
