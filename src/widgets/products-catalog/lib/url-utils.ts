import { FilterState } from "@/widgets/filters";
import { DEFAULT_FILTERS } from "./constants";

/**
 * Создает query string из фильтров
 */
export function createFiltersQueryString(
  filters: FilterState,
  defaultFilters: FilterState = DEFAULT_FILTERS
): string {
  const params: string[] = [];

  if (filters.categories && filters.categories.length > 0) {
    const categoryParams = filters.categories.map(
      (documentId: string) => `categories=${encodeURIComponent(documentId)}`
    );
    params.push(...categoryParams);
  }

  if (filters.price) {
    if (
      filters.price.priceMin !== defaultFilters.price.priceMin &&
      filters.price.priceMin > 0
    ) {
      params.push(`priceMin=${filters.price.priceMin}`);
    }
    if (
      filters.price.priceMax !== defaultFilters.price.priceMax &&
      filters.price.priceMax < 1000000
    ) {
      params.push(`priceMax=${filters.price.priceMax}`);
    }
  }

  // Добавляем фильтры по характеристикам
  if (filters.attributes) {
    for (const [attrId, attrValue] of Object.entries(filters.attributes)) {
      if (attrValue.numberValues && attrValue.numberValues.length > 0) {
        // Кодируем каждое значение отдельно, затем объединяем через запятую
        const encodedValues = attrValue.numberValues.map(v => encodeURIComponent(v)).join(",");
        params.push(
          `attr_${encodeURIComponent(attrId)}_number=${encodedValues}`
        );
      }
      if (attrValue.stringValues && attrValue.stringValues.length > 0) {
        // Кодируем каждое значение отдельно, затем объединяем через запятую
        const encodedValues = attrValue.stringValues.map(v => encodeURIComponent(v)).join(",");
        params.push(
          `attr_${encodeURIComponent(attrId)}_string=${encodedValues}`
        );
      }
      if (attrValue.rangeMin !== undefined) {
        params.push(`attr_${encodeURIComponent(attrId)}_range_min=${attrValue.rangeMin}`);
      }
      if (attrValue.rangeMax !== undefined) {
        params.push(`attr_${encodeURIComponent(attrId)}_range_max=${attrValue.rangeMax}`);
      }
    }
  }

  return params.join("&");
}

/**
 * Обновляет URL с фильтрами
 */
export function updateFiltersURL(filters: FilterState): void {
  if (typeof window === "undefined") {
    return;
  }

  const queryString = createFiltersQueryString(filters);
  const currentUrl = new URL(window.location.href);
  currentUrl.search = queryString ? `?${queryString}` : "";
  currentUrl.searchParams.delete("page");
  window.history.pushState({}, "", currentUrl.pathname + currentUrl.search);
}

