import { ProductType } from "@/entities/product";

export type ProductsListProps = {
  products: ProductType[];
  total: number;
  currentPage: number;
  pageSize?: number;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  categoryPath?: string[]; // Путь категории для сохранения вложенности в URL продукта
};


