import type { ProductType } from "../model/types";

type ProductsQueryParams = {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  /** true = запасные части (part=true), для раздела catalog/zapasnye-chasti-i-rashodnye-materialy */
  includeParts?: boolean;
};

type ProductsResponse = {
  data: ProductType[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

type ProductResponse = {
  data: ProductType;
};

/**
 * Получить список товаров
 * @param params - Параметры запроса
 * @returns Promise с данными товаров
 */
export async function fetchProducts(
  params: ProductsQueryParams = {},
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", String(params.page));
  if (params.pageSize) searchParams.append("pageSize", String(params.pageSize));
  if (params.categorySlug)
    searchParams.append("categorySlug", params.categorySlug);
  if (params.categories) {
    params.categories.forEach((cat) => searchParams.append("categories", cat));
  }
  if (params.minPrice) searchParams.append("minPrice", String(params.minPrice));
  if (params.maxPrice) searchParams.append("maxPrice", String(params.maxPrice));
  if (params.search) searchParams.append("search", params.search);
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.includeParts)
    searchParams.append("includeParts", String(params.includeParts));

  const response = await fetch(`/api/products?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки товаров");
  }

  return response.json();
}

/**
 * Получить товар по slug
 * @param slug - Slug товара
 * @returns Promise с данными товара
 */
export async function fetchProductBySlug(
  slug: string,
): Promise<ProductResponse> {
  const response = await fetch(`/api/products/${slug}`);

  if (!response.ok) {
    throw new Error("Товар не найден");
  }

  return response.json();
}

/**
 * Поиск товаров
 * @param params - Параметры поиска
 * @returns Promise с результатами поиска
 */
type SearchParams = {
  q: string;
  type?: "all" | "products" | "blogs";
  page?: number;
  pageSize?: number;
};

type SearchResponse = {
  data: {
    products?: ProductsResponse;
    blogs?: unknown;
  };
  query: string;
};

export async function searchProducts(
  params: SearchParams,
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();

  searchParams.append("q", params.q);
  if (params.type) searchParams.append("type", params.type);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.pageSize) searchParams.append("pageSize", String(params.pageSize));

  const response = await fetch(`/api/search?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Ошибка поиска");
  }

  return response.json();
}
