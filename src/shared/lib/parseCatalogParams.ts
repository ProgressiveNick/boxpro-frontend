import { FilterState } from "@/widgets/filters/model/types";

export interface CatalogFilters {
  page: number;
  categories: string[];
  priceMin?: number;
  priceMax?: number;
}

import { AttributeFilterValue } from "@/widgets/filters/model/types";

export interface ParsedCatalogParams {
  currentPage: number;
  categories: string[];
  priceMin?: number;
  priceMax?: number;
  attributes?: Record<string, AttributeFilterValue>;
  hasActiveFilters: boolean;
  sort?: string;
  pageSize?: number;
}

type NextSearchParams = { [key: string]: string | string[] | undefined };

/**
 * Парсит параметры поиска для каталога товаров
 * @param searchParams - параметры поиска из Next.js
 * @returns объект с обработанными параметрами
 */
export function parseCatalogParams(
  searchParams: NextSearchParams
): ParsedCatalogParams {
  // Обработка страницы
  const pageParam = searchParams.page;
  const currentPage = pageParam
    ? Array.isArray(pageParam)
      ? parseInt(pageParam[0], 10)
      : parseInt(pageParam, 10)
    : 1;

  // Обработка категорий
  const categoriesParam = searchParams.categories;
  let categories: string[] = [];

  if (categoriesParam) {
    // Поддерживаем как одиночные значения, так и массивы
    categories = Array.isArray(categoriesParam)
      ? categoriesParam
      : [categoriesParam];
  }

  // Обработка цен
  const priceMinParam = searchParams.priceMin;
  const priceMaxParam = searchParams.priceMax;

  const priceMin = priceMinParam
    ? Array.isArray(priceMinParam)
      ? parseInt(priceMinParam[0], 10)
      : parseInt(priceMinParam, 10)
    : undefined;
  const priceMax = priceMaxParam
    ? Array.isArray(priceMaxParam)
      ? parseInt(priceMaxParam[0], 10)
      : parseInt(priceMaxParam, 10)
    : undefined;

  // Обработка характеристик из URL
  // Формат: attr_<attrId>_number=<value1>,<value2> или attr_<attrId>_range_min=<min>&attr_<attrId>_range_max=<max>
  const attributes: Record<string, AttributeFilterValue> = {};
  
  for (const [key, value] of Object.entries(searchParams)) {
    if (key.startsWith("attr_")) {
      const parts = key.split("_");
      if (parts.length >= 3) {
        const attrId = parts[1];
        const filterType = parts[2];
        
        if (!attributes[attrId]) {
          attributes[attrId] = {};
        }
        
        if (filterType === "number" && value) {
          const values = Array.isArray(value) ? value : [value];
          attributes[attrId].numberValues = values.flatMap(v => 
            String(v).split(",").filter(Boolean)
          );
        } else if (filterType === "string" && value) {
          const values = Array.isArray(value) ? value : [value];
          attributes[attrId].stringValues = values.flatMap(v => 
            String(v).split(",").filter(Boolean)
          );
        } else if (filterType === "range") {
          if (parts[3] === "min" && value) {
            const minValue = Array.isArray(value) ? value[0] : value;
            attributes[attrId].rangeMin = parseInt(String(minValue), 10);
          } else if (parts[3] === "max" && value) {
            const maxValue = Array.isArray(value) ? value[0] : value;
            attributes[attrId].rangeMax = parseInt(String(maxValue), 10);
          }
        }
      }
    }
  }

  // Проверка наличия активных фильтров
  const hasAttributeFilters = Object.keys(attributes).length > 0 && 
    Object.values(attributes).some(attr => {
      if (attr.numberValues && attr.numberValues.length > 0) return true;
      if (attr.stringValues && attr.stringValues.length > 0) return true;
      if (attr.rangeMin !== undefined || attr.rangeMax !== undefined) return true;
      return false;
    });
  
  const hasActiveFilters = Boolean(
    categories.length > 0 || 
    priceMin !== undefined || 
    priceMax !== undefined ||
    hasAttributeFilters
  );

  // Обработка сортировки
  const sortParam = searchParams.sort;
  const sort = sortParam
    ? Array.isArray(sortParam)
      ? sortParam[0]
      : sortParam
    : "price:desc";

  // Обработка размера страницы
  // Если pageSize не указан, используем значение по умолчанию 36 (как в ProductsListControls)
  const pageSizeParam = searchParams.pageSize;
  const pageSize = pageSizeParam
    ? Array.isArray(pageSizeParam)
      ? parseInt(pageSizeParam[0], 10)
      : parseInt(pageSizeParam, 10)
    : 36; // Значение по умолчанию должно совпадать с дефолтным значением в ProductsListControls ("36")

  return {
    currentPage,
    categories,
    priceMin,
    priceMax,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    hasActiveFilters,
    sort,
    pageSize,
  };
}

/**
 * Создает объект фильтров для API запроса
 */
export function createApiFilters(params: ParsedCatalogParams) {
  return {
    categories: params.categories,
    minPrice: params.priceMin,
    maxPrice: params.priceMax,
    attributes: params.attributes,
  };
}

/**
 * Создает объект propsFilters для компонента Catalog
 */
export function createPropsFilters(params: ParsedCatalogParams): FilterState {
  return {
    price: {
      priceMin: params.priceMin ?? 0,
      priceMax: params.priceMax ?? 1000000,
    },
    categories: params.categories, // Передаем documentId как строки
    attributes: params.attributes || {},
  };
}
