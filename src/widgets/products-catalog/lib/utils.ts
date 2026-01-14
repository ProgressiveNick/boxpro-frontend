import { Category } from "@/entities/categories";
import { FilterState } from "@/widgets/filters";
import { DEFAULT_FILTERS } from "./constants";

/**
 * Собирает все категории из дерева категорий в плоский список
 */
export function getAllCategories(categories: Category[]): Category[] {
  const res: Category[] = [];
  const addedIds = new Set<number>();

  function mappingCategories(category: Category) {
    if (!addedIds.has(category.id)) {
      res.push(category);
      addedIds.add(category.id);
    }

    if (category.childs) {
      category.childs.forEach((child) => {
        mappingCategories(child);
      });
    }
  }

  categories.forEach((category) => {
    mappingCategories(category);
  });

  return res;
}

/**
 * Получает только дочерние категории текущей категории
 * Исключает саму текущую категорию из списка
 */
export function getChildCategoriesOnly(
  categories: Category[],
  currentCategoryId?: string
): Category[] {
  if (!currentCategoryId) {
    // Если нет текущей категории (например, на главной странице каталога), возвращаем все категории
    return getAllCategories(categories);
  }

  const res: Category[] = [];
  const addedIds = new Set<string>();

  /**
   * Рекурсивно собирает все дочерние категории
   */
  function collectAllChildren(children: Category[]) {
    for (const child of children) {
      const childDocId = child.documentId || String(child.id);
      // Исключаем текущую категорию
      if (childDocId !== currentCategoryId && !addedIds.has(childDocId)) {
        res.push(child);
        addedIds.add(childDocId);
        // Рекурсивно добавляем дочерние категории дочерних
        if (child.childs && child.childs.length > 0) {
          collectAllChildren(child.childs);
        }
      }
    }
  }

  /**
   * Ищет текущую категорию в дереве и собирает её дочерние
   */
  function findAndCollectChildren(categoryList: Category[]) {
    for (const category of categoryList) {
      const categoryDocId = category.documentId || String(category.id);

      if (categoryDocId === currentCategoryId) {
        // Нашли текущую категорию - собираем только её дочерние
        if (category.childs && category.childs.length > 0) {
          collectAllChildren(category.childs);
        }
        return; // Нашли и обработали, выходим
      }

      // Если это не текущая категория, ищем дальше в дочерних
      if (category.childs && category.childs.length > 0) {
        findAndCollectChildren(category.childs);
      }
    }
  }

  findAndCollectChildren(categories);
  return res;
}

/**
 * Проверяет, есть ли активные фильтры
 */
export function hasActiveFilters(filters: FilterState): boolean {
  const hasPriceFilter =
    filters.price.priceMin !== DEFAULT_FILTERS.price.priceMin ||
    filters.price.priceMax !== DEFAULT_FILTERS.price.priceMax;
  const hasCategoryFilter = Boolean(
    filters.categories && filters.categories.length > 0
  );
  const hasAttributeFilter = Boolean(
    filters.attributes &&
      Object.keys(filters.attributes).length > 0 &&
      Object.values(filters.attributes).some((attr) => {
        if (attr.numberValues && attr.numberValues.length > 0) return true;
        if (attr.stringValues && attr.stringValues.length > 0) return true;
        if (attr.rangeMin !== undefined || attr.rangeMax !== undefined)
          return true;
        return false;
      })
  );
  return hasPriceFilter || hasCategoryFilter || hasAttributeFilter;
}

/**
 * Проверяет, изменились ли фильтры по сравнению с примененными
 */
export function isFiltersChanged(
  appliedFilters: FilterState,
  tempFilters: FilterState
): boolean {
  const priceChanged =
    appliedFilters.price.priceMin !== tempFilters.price.priceMin ||
    appliedFilters.price.priceMax !== tempFilters.price.priceMax;
  const categoriesChanged =
    JSON.stringify((appliedFilters.categories || []).sort()) !==
    JSON.stringify((tempFilters.categories || []).sort());
  const attributesChanged =
    JSON.stringify(appliedFilters.attributes || {}) !==
    JSON.stringify(tempFilters.attributes || {});
  return priceChanged || categoriesChanged || attributesChanged;
}

/**
 * Инициализирует фильтры на основе начальных значений
 */
export function initializeFilters(
  initialFilters?: FilterState,
  defaultFilters: FilterState = DEFAULT_FILTERS
): FilterState {
  if (initialFilters) {
    return {
      price: {
        priceMin:
          initialFilters.price.priceMin || defaultFilters.price.priceMin,
        priceMax:
          initialFilters.price.priceMax || defaultFilters.price.priceMax,
      },
      categories: initialFilters.categories || [],
      attributes: initialFilters.attributes || {},
    };
  }
  return defaultFilters;
}
