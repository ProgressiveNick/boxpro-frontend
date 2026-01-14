import { ProductType } from "@/entities/product";
import { Category } from "@/entities/categories";
import { FilterState } from "@/widgets/filters";

import { AttributeFilter } from "@/entities/product-attributes/api/getCategoryAttributes";

export type ProductsCatalogProps = {
  products: ProductType[];
  categories: Category[];
  total: number;
  currentPage: number;
  pageSize?: number;
  currentCategoryId?: string; // documentId текущей категории
  initialFilters?: FilterState;
  hasActiveFilters?: boolean;
  attributes?: AttributeFilter[];
  hideFilters?: boolean; // скрыть колонку фильтров и растянуть контент на всю ширину
  categoryPath?: string[]; // Путь категории для сохранения вложенности в URL продукта
};

export type ProductsCatalogFiltersProps = {
  initialFilters?: FilterState;
  categories: Category[];
  currentCategoryId?: string; // documentId текущей категории
  attributes?: AttributeFilter[];
  onFilterApply?: () => void;
};
