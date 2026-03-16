/**
 * Слой чтения статической карты категорий (public/data/category-map.json).
 * Используется для меню, хлебных крошек, подкатегорий и списка documentId без запросов к Strapi.
 */

import { readFile } from "fs/promises";
import path from "path";
import type { Category } from "../model";

const CATEGORY_MAP_PATH = "public/data/category-map.json";

export interface CategoryMapNodeFlat {
  documentId: string;
  name: string;
  slug: string;
  url: string;
  image: string | null;
  parentDocumentId: string | null;
}

export interface CategoryMapTreeNode {
  documentId: string;
  name: string;
  slug: string;
  url: string;
  image: string | null;
  children: CategoryMapTreeNode[];
}

export interface CategoryMap {
  tree: CategoryMapTreeNode[];
  byDocumentId: Record<string, CategoryMapNodeFlat>;
}

let cachedMap: CategoryMap | null = null;

/**
 * Загружает карту категорий с диска (с кэшем в памяти).
 * Возвращает null, если файла нет.
 */
export async function getCategoryMap(): Promise<CategoryMap | null> {
  if (cachedMap) return cachedMap;

  try {
    const filePath = path.join(process.cwd(), CATEGORY_MAP_PATH);
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as CategoryMap;

    if (
      !data ||
      !Array.isArray(data.tree) ||
      !data.byDocumentId ||
      typeof data.byDocumentId !== "object"
    ) {
      return null;
    }

    cachedMap = data;
    return cachedMap;
  } catch {
    return null;
  }
}

/**
 * Путь slug'ов от корня до категории (обратная рекурсия по parentDocumentId).
 */
export function getPathByDocumentId(
  map: CategoryMap,
  documentId: string
): string[] {
  const slugs: string[] = [];
  let current: CategoryMapNodeFlat | undefined = map.byDocumentId[documentId];

  while (current) {
    slugs.unshift(current.slug);
    current = current.parentDocumentId
      ? map.byDocumentId[current.parentDocumentId]
      : undefined;
  }

  return slugs;
}

/**
 * Найти узел в дереве по documentId.
 */
function findNodeInTree(
  nodes: CategoryMapTreeNode[],
  documentId: string
): CategoryMapTreeNode | null {
  for (const node of nodes) {
    if (node.documentId === documentId) return node;
    const found = findNodeInTree(node.children, documentId);
    if (found) return found;
  }
  return null;
}

/**
 * documentId самой категории и всех потомков (обход дерева вниз).
 */
export function getChildDocumentIds(
  map: CategoryMap,
  documentId: string
): string[] {
  const result: string[] = [];
  const node = findNodeInTree(map.tree, documentId);
  if (!node) {
    result.push(documentId);
    return result;
  }

  function collect(n: CategoryMapTreeNode) {
    result.push(n.documentId);
    for (const child of n.children) collect(child);
  }
  collect(node);
  return result;
}

/**
 * Узел из плоского индекса (без вложенных children).
 */
export function getCategoryByDocumentId(
  map: CategoryMap,
  documentId: string
): CategoryMapNodeFlat | null {
  return map.byDocumentId[documentId] ?? null;
}

/**
 * Найти узел в дереве по пути slug'ов (последовательный обход).
 */
export function getNodeByPath(
  map: CategoryMap,
  slugs: string[]
): CategoryMapTreeNode | null {
  if (!slugs.length) return null;

  let current: CategoryMapTreeNode[] = map.tree;
  let found: CategoryMapTreeNode | null = null;

  for (const slug of slugs) {
    const node = current.find((n) => n.slug === slug);
    if (!node) return null;
    found = node;
    current = node.children;
  }

  return found;
}

/**
 * Все пути категорий (для generateStaticParams).
 */
export function getAllPathsFromMap(map: CategoryMap): string[][] {
  const paths: string[][] = [];

  function walk(nodes: CategoryMapTreeNode[], prefix: string[]) {
    for (const node of nodes) {
      const p = [...prefix, node.slug];
      paths.push(p);
      if (node.children.length) walk(node.children, p);
    }
  }
  walk(map.tree, []);
  return paths;
}

/**
 * Дерево в формате Category[] для CatalogMenu (childs, img_menu, documentId, slug, name).
 * У дочерних категорий заполняется parent, чтобы getCategoryUrl/getPath строили полный путь.
 */
export function getTreeForMenu(map: CategoryMap): Category[] {
  function mapNode(n: CategoryMapTreeNode, parent?: Category): Category {
    const category: Category = {
      id: 0,
      documentId: n.documentId,
      name: n.name,
      slug: n.slug,
      img_menu: n.image ? { url: n.image } : undefined,
      childs: undefined,
    };
    if (parent) {
      category.parent = parent;
    }
    if (n.children.length) {
      category.childs = n.children.map((child) => mapNode(child, category));
    }
    return category;
  }
  return map.tree.map((n) => mapNode(n));
}

/**
 * Дочерние категории текущей (по documentId) в формате Category[].
 * У каждой дочерней категории задаётся parent (минимальная ссылка с documentId/slug),
 * чтобы getCategoryUrl строил полный путь при передаче allCategories из меню.
 */
export function getChildCategoriesFromMap(
  map: CategoryMap,
  parentDocumentId: string
): Category[] {
  const node = findNodeInTree(map.tree, parentDocumentId);
  if (!node || !node.children.length) return [];

  const parentRef: Pick<Category, "id" | "documentId" | "slug" | "name"> = {
    id: 0,
    documentId: node.documentId,
    slug: node.slug,
    name: node.name,
  };

  return node.children.map((n): Category => ({
    id: 0,
    documentId: n.documentId,
    name: n.name,
    slug: n.slug,
    img_menu: n.image ? { url: n.image } : undefined,
    parent: parentRef,
  }));
}

/**
 * Индекс slug -> documentId для быстрого поиска по slug (строится при первом обращении).
 */
let slugToIdCache: Record<string, string> | null = null;

function buildSlugToId(map: CategoryMap): Record<string, string> {
  if (slugToIdCache) return slugToIdCache;
  const out: Record<string, string> = {};
  for (const id of Object.keys(map.byDocumentId)) {
    const slug = map.byDocumentId[id].slug;
    if (slug) out[slug] = id;
  }
  slugToIdCache = out;
  return out;
}

export function getDocumentIdBySlug(map: CategoryMap, slug: string): string | null {
  return buildSlugToId(map)[slug] ?? null;
}

/**
 * Breadcrumb overrides: slug -> name для пути slugs (для совместимости с Breadcrumbs pathOverrides).
 */
export function getBreadcrumbOverridesFromMap(
  map: CategoryMap,
  slugs: string[]
): Record<string, string> {
  const overrides: Record<string, string> = {};
  for (let i = 0; i < slugs.length; i++) {
    const pathSlugs = slugs.slice(0, i + 1);
    const node = getNodeByPath(map, pathSlugs);
    if (node) overrides[node.slug] = node.name;
  }
  return overrides;
}
