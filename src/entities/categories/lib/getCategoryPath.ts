import { Category } from "../model";
import { CategoryTree } from "./CategoryTree";

/**
 * Получить полный путь категории (с родительскими категориями)
 * @param category - категория
 * @param allCategories - все категории для поиска родительских
 * @returns массив slug'ов от корня до категории
 */
export function getCategoryPath(
  category: Category,
  allCategories: Category[]
): string[] {
  const tree = new CategoryTree(allCategories);
  return tree.getPath(category);
}

/**
 * Получить URL категории с полным путем
 * @param category - категория
 * @param allCategories - все категории для поиска родительских
 * @returns URL вида /catalog/parent-slug/child-slug
 */
export function getCategoryUrl(
  category: Category,
  allCategories: Category[]
): string {
  const tree = new CategoryTree(allCategories);
  return tree.getUrl(category);
}

