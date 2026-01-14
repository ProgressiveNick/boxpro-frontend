/**
 * @deprecated Используйте searchProducts из ./api.ts
 * Оставлено для обратной совместимости
 */
import { searchProducts as searchProductsApi } from "./api";
import type { ProductType } from "../model/types";

type SearchProductsParams = {
  searchQuery: string;
  page?: number;
  pageSize?: number;
};

export type SearchProductsResponse = {
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

/**
 * Поиск товаров (клиентская функция, через /api/search)
 * @deprecated Используйте searchProducts из ./api.ts
 */
export const searchProducts = async ({
  searchQuery,
  page = 1,
  pageSize = 5,
}: SearchProductsParams): Promise<SearchProductsResponse> => {
  if (searchQuery.length < 3) {
    return {
      data: [],
      meta: {
        pagination: {
          total: 0,
          page: 1,
          pageSize: 5,
          pageCount: 0,
        },
      },
    };
  }

  const result = await searchProductsApi({
    q: searchQuery,
    type: "products",
    page,
    pageSize,
  });

  return {
    data: (result.data.products?.data || []) as ProductType[],
    meta: result.data.products?.meta || {
      pagination: {
        total: 0,
        page: 1,
        pageSize: 5,
        pageCount: 0,
      },
    },
  };
};
