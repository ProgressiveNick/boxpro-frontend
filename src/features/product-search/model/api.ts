import { searchProducts as searchProductsAction } from "@/entities/product/api/actions";
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
 * Поиск товаров через Server Action
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

  const result = await searchProductsAction({
    q: params.searchQuery,
    type: "products",
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 5,
  });

  const products = result.data?.products;
  return {
    data: (products?.data ?? []) as ProductType[],
    meta: products?.meta ?? {
      pagination: {
        total: 0,
        page: 1,
        pageSize: params.pageSize ?? 5,
        pageCount: 0,
      },
    },
  };
}

