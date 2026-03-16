import { Category } from "../model";
import { cache } from "react";
import { getCategoryMap, getNodeByPath } from "./categoryMap";
import type { CategoryMapTreeNode } from "./categoryMap";

function mapTreeNodeToCategory(n: CategoryMapTreeNode): Category {
  return {
    id: 0,
    documentId: n.documentId,
    name: n.name,
    slug: n.slug,
    img_menu: n.image ? { url: n.image } : undefined,
    childs: n.children.length ? n.children.map(mapTreeNodeToCategory) : undefined,
  };
}

/**
 * Получить категорию по полному пути (массив slug'ов).
 * Только из статической карты категорий.
 */
export const getCategoryByPath = cache(
  async (slugs: string[]): Promise<Category | null> => {
    if (!slugs || slugs.length === 0) {
      return null;
    }

    const map = await getCategoryMap();
    if (!map || map.tree.length === 0) {
      return null;
    }

    const node = getNodeByPath(map, slugs);
    if (!node) return null;

    return mapTreeNodeToCategory(node);
  }
);
