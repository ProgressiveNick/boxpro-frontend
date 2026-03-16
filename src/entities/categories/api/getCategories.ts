import { cache } from "react";
import { Category } from "../model";
import {
  getCategoryMap,
  getChildDocumentIds,
  getDocumentIdBySlug,
  getChildCategoriesFromMap,
  getCategoryByDocumentId,
} from "../lib/categoryMap";

const categoryIdsCache = new Map<string, string[]>();

export function clearCategoryIdsCache() {
  categoryIdsCache.clear();
}

/**
 * Получить все ID дочерних категорий (включая саму категорию).
 * Только из статической карты категорий.
 * @param _allCategories — не используется, оставлен для совместимости API.
 */
export const getAllCategoryIds = cache(
  async (
    categoryId: string,
    _allCategories?: Category[]
  ): Promise<string[]> => {
    if (categoryIdsCache.has(categoryId)) {
      return categoryIdsCache.get(categoryId)!;
    }

    const map = await getCategoryMap();
    if (map && map.byDocumentId[categoryId]) {
      const ids = getChildDocumentIds(map, categoryId);
      categoryIdsCache.set(categoryId, ids);
      return ids;
    }

    categoryIdsCache.set(categoryId, [categoryId]);
    return [categoryId];
  }
);

/**
 * Получить дочерние категории по slug родителя.
 * Только из статической карты категорий.
 * @param _allCategories — не используется, оставлен для совместимости API.
 */
export const getChildsCategory = cache(
  async (
    categorSlug: string,
    _allCategories?: Category[]
  ): Promise<Category[]> => {
    if (!categorSlug) {
      return [];
    }

    const map = await getCategoryMap();
    if (!map || map.tree.length === 0) {
      return [];
    }

    const parentId = getDocumentIdBySlug(map, categorSlug);
    if (!parentId) {
      return [];
    }

    return getChildCategoriesFromMap(map, parentId);
  }
);

/**
 * Получить категорию по slug (массив из одного элемента для совместимости).
 * Только из статической карты категорий.
 */
export const getCategory = cache(async (slug: string): Promise<Category[]> => {
  const map = await getCategoryMap();
  if (!map) return [];

  const documentId = getDocumentIdBySlug(map, slug);
  if (!documentId) return [];

  const flat = getCategoryByDocumentId(map, documentId);
  if (!flat) return [];

  const category: Category = {
    id: 0,
    documentId: flat.documentId,
    name: flat.name,
    slug: flat.slug,
    img_menu: flat.image ? { url: flat.image } : undefined,
  };
  return [category];
});
