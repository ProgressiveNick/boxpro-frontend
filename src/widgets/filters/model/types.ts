import { Category } from "@/entities/categories";

export type FilterState = {
  price: {
    priceMin: number;
    priceMax: number;
  };
  categories: string[]; // documentId категорий
  attributes?: Record<string, AttributeFilterValue>; // Ключ - documentId характеристики
};

export type AttributeFilterValue = {
  // Для number: массив выбранных значений (external_id)
  numberValues?: string[];
  // Для string: массив выбранных значений (external_id)
  stringValues?: string[];
  // Для range: min и max
  rangeMin?: number;
  rangeMax?: number;
};

import { AttributeFilter } from "@/entities/product-attributes/api/getCategoryAttributes";

export type FilterProps = {
  isOpen: boolean;
  onClose: () => void;
  onChange: (filters: FilterState) => void;
  categories: Category[];
  data: unknown[];
  filters: FilterState;
  reset: () => void;
  attributes?: AttributeFilter[]; // Список характеристик для поиска attrId по названию
};
