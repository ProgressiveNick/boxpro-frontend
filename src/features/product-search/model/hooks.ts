"use client";

import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "./api";

type SearchProductsParams = {
  searchQuery: string;
  page?: number;
  pageSize?: number;
};

/**
 * Хук для поиска товаров
 */
export function useSearchProducts(params: SearchProductsParams) {
  return useQuery({
    queryKey: ["search-products", params.searchQuery, params.page],
    queryFn: () => searchProducts(params),
    enabled: !!params.searchQuery && params.searchQuery.length >= 3,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}
