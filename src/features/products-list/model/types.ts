import { ProductType } from "@/entities/product";

export type ProductsListProps = {
  products: ProductType[];
  total: number;
  currentPage: number;
  pageSize?: number;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  /** Имя списка для eCommerce (impressions): "Category", "Search", "Recommendations" */
  listName?: string;
};


