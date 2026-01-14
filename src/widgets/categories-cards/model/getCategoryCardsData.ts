import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { getCategoryUrl } from "@/entities/categories/lib/getCategoryPath";
import { Category } from "@/entities/categories";

/**
 * Найти категорию по имени в дереве категорий
 */
function findCategoryByName(
  categories: Category[],
  name: string
): Category | null {
  for (const category of categories) {
    if (category.name === name) {
      return category;
    }
    if (category.childs) {
      const found = findCategoryByName(category.childs, name);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Получить дочерние категории для родительской категории
 */
function getChildCategories(
  parentCategory: Category,
  maxCount?: number
): Category[] {
  if (!parentCategory.childs || parentCategory.childs.length === 0) {
    return [];
  }
  const children = parentCategory.childs;
  return maxCount ? children.slice(0, maxCount) : children;
}

/**
 * Получить данные для карточек категорий
 */
export async function getCategoryCardsData() {
  const allCategories = await getCatalogMenu();

  // Маппинг названий родительских категорий на их имена в Strapi
  const parentCategoryMap: Record<string, string> = {
    "Пищевое оборудование": "Пищевое оборудование",
    "Фасовочное оборудование": "Фасовочноe оборудование", // Обратите внимание на "e" вместо "о"
    "Упаковочное оборудование": "Упаковочное оборудование",
    "Оборудование для HORECA": "Оборудование HoReCa",
    "Расходные материалы и запчасти": "Запасные части и расходные материалы",
  };

  const cards = [];

  // Пищевое оборудование
  const pishchevoeCategory = findCategoryByName(
    allCategories,
    parentCategoryMap["Пищевое оборудование"]
  );
  if (pishchevoeCategory) {
    const allChildren = getChildCategories(pishchevoeCategory);
    const children = allChildren.slice(0, 10);
    const links = children.map((child) => ({
      name: child.name,
      url: getCategoryUrl(child, allCategories),
    }));

    cards.push({
      name: "Пищевое оборудование",
      url: getCategoryUrl(pishchevoeCategory, allCategories),
      imgSrc: "/img/pishevoe.png",
      links,
    });
  }

  // Фасовочное оборудование
  const fasovochnoeCategory = findCategoryByName(
    allCategories,
    parentCategoryMap["Фасовочное оборудование"]
  );
  if (fasovochnoeCategory) {
    const allChildren = getChildCategories(fasovochnoeCategory);
    const children = allChildren.slice(0, 12);
    const links = children.map((child) => ({
      name: child.name,
      url: getCategoryUrl(child, allCategories),
    }));

    cards.push({
      name: "Фасовочное оборудование",
      url: getCategoryUrl(fasovochnoeCategory, allCategories),
      links,
    });
  }

  // Упаковочное оборудование
  const upakovochnoeCategory = findCategoryByName(
    allCategories,
    parentCategoryMap["Упаковочное оборудование"]
  );
  if (upakovochnoeCategory) {
    const allChildren = getChildCategories(upakovochnoeCategory);
    const children = allChildren.slice(0, 12);
    const links = children.map((child) => ({
      name: child.name,
      url: getCategoryUrl(child, allCategories),
    }));

    cards.push({
      name: "Упаковочное оборудование",
      url: getCategoryUrl(upakovochnoeCategory, allCategories),
      imgSrc: "/img/upack.png",
      links,
    });
  }

  // Оборудование для HORECA
  const horecaCategory = findCategoryByName(
    allCategories,
    parentCategoryMap["Оборудование для HORECA"]
  );
  if (horecaCategory) {
    const allChildren = getChildCategories(horecaCategory);
    const children = allChildren.slice(0, 9);
    const links = children.map((child) => ({
      name: child.name,
      url: getCategoryUrl(child, allCategories),
    }));

    cards.push({
      name: "Оборудование для HORECA",
      url: getCategoryUrl(horecaCategory, allCategories),
      imgSrc: "/img/horeca.png",
      links,
    });
  }

  // Оборудование для маркетплейсов (специальная категория)
  const vakuumnyeCategory = findCategoryByName(
    allCategories,
    "Вакуумные упаковщики"
  );
  const gorizontalnyeCategory = findCategoryByName(
    allCategories,
    "Горизонтальные упаковочные машины"
  );
  const vertikalnyeCategory = findCategoryByName(
    allCategories,
    "Вертикальные фасовочно упаковочные машины (со встроенным дозатором)"
  );
  const etiketirovshchikiCategory = findCategoryByName(
    allCategories,
    "Этикетировщики"
  );
  const dateryCategory = findCategoryByName(
    allCategories,
    "Датеры стационарные"
  );
  const termousadochnyeCategory = findCategoryByName(
    allCategories,
    "Термоусадочные аппараты"
  );

  const marketplaceLinks = [];
  if (vakuumnyeCategory) {
    marketplaceLinks.push({
      name: "Вакуумные упаковщики",
      url: getCategoryUrl(vakuumnyeCategory, allCategories),
    });
  }
  if (gorizontalnyeCategory) {
    marketplaceLinks.push({
      name: "Горизонтальные упаковочные машины",
      url: getCategoryUrl(gorizontalnyeCategory, allCategories),
    });
  }
  if (vertikalnyeCategory) {
    marketplaceLinks.push({
      name: "Вертикальные фасовочно упаковочные машины",
      url: getCategoryUrl(vertikalnyeCategory, allCategories),
    });
  }
  if (etiketirovshchikiCategory) {
    marketplaceLinks.push({
      name: "Этикетировщики",
      url: getCategoryUrl(etiketirovshchikiCategory, allCategories),
    });
  }
  if (dateryCategory) {
    marketplaceLinks.push({
      name: "Датеры",
      url: getCategoryUrl(dateryCategory, allCategories),
    });
  }
  if (termousadochnyeCategory) {
    marketplaceLinks.push({
      name: "Термоусадочные аппараты",
      url: getCategoryUrl(termousadochnyeCategory, allCategories),
    });
  }

  if (marketplaceLinks.length > 0) {
    // Для маркетплейсов берем первые 9 ссылок
    const limitedMarketplaceLinks = marketplaceLinks.slice(0, 9);
    // Добавляем "Смотреть всё" только если ссылок больше 9
    if (marketplaceLinks.length > 9 && upakovochnoeCategory) {
      limitedMarketplaceLinks.push({
        name: "Смотреть всё",
        url: getCategoryUrl(upakovochnoeCategory, allCategories),
      });
    }
    cards.push({
      name: "Оборудование для маркетплейсов",
      url: upakovochnoeCategory
        ? getCategoryUrl(upakovochnoeCategory, allCategories)
        : "/catalog",
      imgSrc: "/img/markets.png",
      links: limitedMarketplaceLinks,
    });
  }

  // Расходные материалы и запчасти
  const zapasnyeCategory = findCategoryByName(
    allCategories,
    parentCategoryMap["Расходные материалы и запчасти"]
  );
  if (zapasnyeCategory) {
    const allChildren = getChildCategories(zapasnyeCategory);
    const children = allChildren.slice(0, 9);
    const links = children.map((child) => ({
      name: child.name,
      url: getCategoryUrl(child, allCategories),
    }));

    cards.push({
      name: "Расходные материалы и запчасти",
      url: getCategoryUrl(zapasnyeCategory, allCategories),
      imgSrc: "/img/rasshodnye.png",
      links,
    });
  }

  // Сервисный центр (статические ссылки на услуги)
  const serviceLinks = [
    { name: "Выездная диагностика", url: "/services/field-diagnostics" },
    { name: "Компьютерная диагностика", url: "/services/computer-analysis" },
    { name: "Ручная диагностика", url: "/services/manual-diagnostics" },
    { name: "Замена расходников", url: "/services/replacement" },
    { name: "Капитальный ремонт", url: "/services/overhaul" },
    { name: "Ремонт", url: "/services/remont" },
    { name: "Наладка", url: "/services/naladka" },
    { name: "Обслуживание", url: "/services/obsluzhivanie" },
  ];
  // Берем первые 9 ссылок
  const limitedServiceLinks = serviceLinks.slice(0, 9);

  cards.push({
    name: "Сервисный центр",
    url: "/services/remont",
    imgSrc: "/img/services.png",
    links: limitedServiceLinks,
  });

  return cards;
}
