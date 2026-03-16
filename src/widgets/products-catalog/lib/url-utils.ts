import type { AttributeFilter } from "@/entities/product-attributes/api/getCategoryAttributes";
import { FilterState } from "@/widgets/filters";
import type { AttributeFilterValue } from "@/widgets/filters/model/types";
import { DEFAULT_FILTERS } from "./constants";

const MAX_QUERY_LENGTH = 1800;
const FILTER_STATE_KEY_PREFIX = "catalog_filters_";

/**
 * Создаёт query string из фильтров. Если передан attributes, в URL подставляются SEO-slug
 * (короткие читаемые названия); иначе — id (для обратной совместимости).
 * При длине query > MAX_QUERY_LENGTH атрибуты не добавляются в URL (см. sessionStorage fallback).
 */
export function createFiltersQueryString(
  filters: FilterState,
  defaultFilters: FilterState = DEFAULT_FILTERS,
  attributes?: AttributeFilter[]
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

  const attrById = new Map<string, AttributeFilter>();
  if (attributes) {
    for (const a of attributes) {
      attrById.set(a.id, a);
      a.id.split(",").forEach((id) => attrById.set(id.trim(), a));
    }
  }

  if (filters.attributes) {
    for (const [attrId, attrValue] of Object.entries(filters.attributes)) {
      const attr = attrById.get(attrId);
      const paramKey = attr?.slug ?? attrId;

      const valueToSlug = (valueId: string, type: "number" | "string"): string => {
        if (!attr?.values) return valueId;
        const v = attr.values.find(
          (val) => val.id === valueId || val.id.split(",").includes(valueId)
        );
        return v?.slug ?? valueId;
      };

      if (attrValue.numberValues && attrValue.numberValues.length > 0) {
        const encodedValues = attrValue.numberValues
          .map((v) => encodeURIComponent(attributes ? valueToSlug(v, "number") : v))
          .join(",");
        params.push(`attr_${encodeURIComponent(paramKey)}_number=${encodedValues}`);
      }
      if (attrValue.stringValues && attrValue.stringValues.length > 0) {
        const encodedValues = attrValue.stringValues
          .map((v) => encodeURIComponent(attributes ? valueToSlug(v, "string") : v))
          .join(",");
        params.push(`attr_${encodeURIComponent(paramKey)}_string=${encodedValues}`);
      }
      if (attrValue.rangeMin !== undefined) {
        params.push(`attr_${encodeURIComponent(paramKey)}_range_min=${attrValue.rangeMin}`);
      }
      if (attrValue.rangeMax !== undefined) {
        params.push(`attr_${encodeURIComponent(paramKey)}_range_max=${attrValue.rangeMax}`);
      }
    }
  }

  return params.join("&");
}

/**
 * Преобразует атрибуты из формата URL (ключи и значения — slug) в формат по id для API и UI.
 */
export function resolveAttributeSlugsToIds(
  attributes: AttributeFilter[],
  slugBasedAttributes: Record<string, AttributeFilterValue> | undefined
): Record<string, AttributeFilterValue> | undefined {
  if (!slugBasedAttributes || Object.keys(slugBasedAttributes).length === 0) {
    return slugBasedAttributes;
  }
  const bySlug = new Map(attributes.map((a) => [a.slug ?? a.id, a]));
  const result: Record<string, AttributeFilterValue> = {};

  for (const [key, attrValue] of Object.entries(slugBasedAttributes)) {
    const attr = bySlug.get(key) ?? attributes.find((a) => a.id === key);
    if (!attr) continue;

    const slugToIds = (slugs: string[], type: "number" | "string"): string[] => {
      const ids: string[] = [];
      for (const s of slugs) {
        const val = attr.values.find(
          (v) => v.slug === s || v.id === s || v.id.split(",").includes(s)
        );
        if (val) ids.push(...val.id.split(",").filter(Boolean));
        else ids.push(s);
      }
      return [...new Set(ids)];
    };

    result[attr.id] = {
      ...(attrValue.numberValues?.length && {
        numberValues: slugToIds(attrValue.numberValues, "number"),
      }),
      ...(attrValue.stringValues?.length && {
        stringValues: slugToIds(attrValue.stringValues, "string"),
      }),
      ...(attrValue.rangeMin !== undefined && { rangeMin: attrValue.rangeMin }),
      ...(attrValue.rangeMax !== undefined && { rangeMax: attrValue.rangeMax }),
    };
  }
  return result;
}

/**
 * Сохраняет фильтры в sessionStorage при слишком длинном URL.
 * Возвращает query string для URL: либо полный, либо короткий с fs=1.
 */
export function createFiltersQueryStringWithFallback(
  filters: FilterState,
  pathname: string,
  defaultFilters: FilterState,
  attributes?: AttributeFilter[]
): string {
  const full = createFiltersQueryString(filters, defaultFilters, attributes);
  if (full.length <= MAX_QUERY_LENGTH) return full;
  try {
    const key = FILTER_STATE_KEY_PREFIX + pathname;
    sessionStorage.setItem(key, JSON.stringify(filters));
    const base = [
      filters.categories?.length ? `categories=${filters.categories.map((c) => encodeURIComponent(c)).join("&categories=")}` : "",
      filters.price?.priceMin ? `priceMin=${filters.price.priceMin}` : "",
      filters.price?.priceMax && filters.price.priceMax < 1000000 ? `priceMax=${filters.price.priceMax}` : "",
    ].filter(Boolean).join("&");
    return base ? `${base}&fs=1` : "fs=1";
  } catch {
    return full;
  }
}

/**
 * Читает фильтры из sessionStorage, если в URL передан fs=1.
 */
export function getFiltersFromSession(pathname: string): FilterState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FILTER_STATE_KEY_PREFIX + pathname);
    if (!raw) return null;
    return JSON.parse(raw) as FilterState;
  } catch {
    return null;
  }
}

/**
 * Обновляет URL с фильтрами (SEO-slug при наличии attributes; при длинном query — fs=1 + sessionStorage).
 */
export function updateFiltersURL(
  filters: FilterState,
  attributes?: AttributeFilter[]
): void {
  if (typeof window === "undefined") return;
  const pathname = window.location.pathname;
  const queryString = createFiltersQueryStringWithFallback(
    filters,
    pathname,
    DEFAULT_FILTERS,
    attributes
  );
  const currentUrl = new URL(window.location.href);
  currentUrl.search = queryString ? `?${queryString}` : "";
  currentUrl.searchParams.delete("page");
  window.history.pushState({}, "", currentUrl.pathname + currentUrl.search);
}

