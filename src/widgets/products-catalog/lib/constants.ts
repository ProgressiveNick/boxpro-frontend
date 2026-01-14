import { FilterState } from "@/widgets/filters";

export const DEFAULT_FILTERS: FilterState = {
  price: {
    priceMin: 0,
    priceMax: 1000000,
  },
  categories: [],
  attributes: {},
};

