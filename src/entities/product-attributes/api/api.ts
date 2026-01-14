type FilterValue = {
  id: string;
  value: string | number | boolean;
  stringValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  comment?: string;
};

export type Filter = {
  id: string;
  name: string;
  type: string;
  unit: string | null;
  values: FilterValue[];
};

type FiltersResponse = {
  data: Filter[];
};

type AttributesQueryParams = {
  populate?: string;
};

type Attribute = {
  id: number;
  documentId?: string;
  name: string;
  type: string;
  unit?: string;
  values?: unknown[];
};

type AttributesResponse = {
  data: Attribute[];
  meta?: {
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

/**
 * Получить все уникальные фильтры для категории (клиентская функция, через /api/filters)
 * Автоматически включает товары из всех дочерних подкатегорий
 * @param categorySlug - Slug категории (опционально)
 */
export async function fetchFilters(
  categorySlug?: string
): Promise<FiltersResponse> {
  const searchParams = new URLSearchParams();

  if (categorySlug) {
    searchParams.append("categorySlug", categorySlug);
  }

  const response = await fetch(`/api/filters?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки фильтров");
  }

  return response.json();
}

/**
 * Получить список характеристик (клиентская функция, через /api/attributes)
 */
export async function fetchAttributes(
  params: AttributesQueryParams = {}
): Promise<AttributesResponse> {
  const searchParams = new URLSearchParams();

  if (params.populate) searchParams.append("populate", params.populate);

  const response = await fetch(`/api/attributes?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Ошибка загрузки характеристик");
  }

  return response.json();
}

