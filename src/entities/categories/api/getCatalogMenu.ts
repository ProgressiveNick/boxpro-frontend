import { cache } from "react";
import { Category } from "../model";
import {
  getCategoryMap,
  getTreeForMenu,
  getAllPathsFromMap,
} from "../lib/categoryMap";

/**
 * Получить структуру каталога из статической карты (public/data/category-map.json).
 * Запросов к Strapi за категориями нет.
 */
export const getCatalogMenu = cache(async (): Promise<Category[]> => {
  const map = await getCategoryMap();
  if (map && map.tree.length > 0) {
    return getTreeForMenu(map);
  }
  return [];
});

/**
 * Получить все пути категорий для generateStaticParams.
 * Только из карты категорий.
 */
export async function getAllCategoryPaths(): Promise<string[][]> {
  const map = await getCategoryMap();
  if (map && map.tree.length > 0) {
    return getAllPathsFromMap(map);
  }
  return [];
}
