import { searchProducts as searchProductsApi } from "@/entities/product/api/api";
import type { ProductType } from "@/entities/product/model/types";

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
 * Поиск товаров (клиентская функция)
 * Обертка над searchProducts из entities для обратной совместимости
 */
export async function searchProducts(
  params: SearchProductsParams
): Promise<SearchProductsResponse> {
  if (params.searchQuery.length < 3) {
    return {
      data: [],
      meta: {
        pagination: {
          total: 0,
          page: 1,
          pageSize: params.pageSize || 5,
          pageCount: 0,
        },
      },
    };
  }

  const result = await searchProductsApi({
    q: params.searchQuery,
    type: "products",
    page: params.page || 1,
    pageSize: params.pageSize || 5,
  });

  return {
    data: (result.data.products?.data || []) as ProductType[],
    meta: result.data.products?.meta || {
      pagination: {
        total: 0,
        page: 1,
        pageSize: params.pageSize || 5,
        pageCount: 0,
      },
    },
  };
}

