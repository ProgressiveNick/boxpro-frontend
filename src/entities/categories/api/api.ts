import type { Category } from "../model/types";

type CategoriesQueryParams = {
  populate?: string;
  includeChildren?: boolean;
  parentSlug?: string;
};

type CategoriesResponse = {
  data: Category[];
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

type CategoryResponse = {
  data: Category;
};

type CategoryChildrenResponse = {
  data: Category[];
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

/**
 * Получить список категорий (клиентская функция, через /api/categories)
 */
export async function fetchCategories(
  params: CategoriesQueryParams = {}
): Promise<CategoriesResponse> {
  const searchParams = new URLSearchParams();

  if (params.populate) searchParams.append("populate", params.populate);
  if (params.includeChildren)
    searchParams.append("includeChildren", "true");
  if (params.parentSlug) searchParams.append("parentSlug", params.parentSlug);

  const response = await fetch(`/api/categories?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки категорий");
  }

  return response.json();
}

/**
 * Получить категорию по slug (клиентская функция, через /api/categories/[slug])
 */
export async function fetchCategoryBySlug(
  slug: string,
  params: { includeChildren?: boolean } = {}
): Promise<CategoryResponse> {
  const searchParams = new URLSearchParams();

  if (params.includeChildren !== undefined) {
    searchParams.append("includeChildren", String(params.includeChildren));
  }

  const response = await fetch(
    `/api/categories/${slug}?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Категория не найдена");
  }

  return response.json();
}

/**
 * Получить все дочерние категории рекурсивно (клиентская функция, через /api/categories/[slug]/children)
 */
export async function fetchCategoryChildren(
  slug: string
): Promise<CategoryChildrenResponse> {
  const response = await fetch(`/api/categories/${slug}/children`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки дочерних категорий");
  }

  return response.json();
}

