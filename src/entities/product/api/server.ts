/**
 * Server-side функции для запросов к Strapi (для SSR)
 * Используются только в server components
 */

import { categoriesService, productsServerService } from "@/shared/api/server";
import { getAllCategoryIds } from "@/entities/categories/api/getCategories";
import type { ProductType } from "../model/types";
import { getServerCache, setServerCache } from "@/shared/lib/server-cache";
import { cache } from "react";
import type { Category } from "@/entities/categories";

import { AttributeFilterValue } from "@/widgets/filters/model/types";

type FetchProductsParams = {
  filters: {
    categories: string[];
    minPrice?: number;
    maxPrice?: number;
    attributes?: Record<string, AttributeFilterValue>;
  };
  sort?: string;
  page?: number;
  pageSize?: number;
  kategoria?: string;
  allCategories?: Category[]; // Опционально: уже загруженные категории для оптимизации
};

type FetchProductsResponse = {
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

const CACHE_KEY_PREFIX = "products";
const CACHE_VERSION = "2.0"; // Версия кэша, увеличиваем при изменении структуры
const CACHE_TTL = 5 * 60 * 1000; // 5 минут для динамического контента

/**
 * Получить список товаров (server-side, напрямую к Strapi)
 * Используется только в server components для SSR
 * С кэшированием для улучшения производительности
 */
export const getProducts = cache(
  async (
    params: FetchProductsParams = { filters: { categories: [] } }
  ): Promise<FetchProductsResponse> => {
    const { page = 1, pageSize = 36, sort = "price:asc" } = params;
    
    // Создаем ключ кэша на основе параметров запроса
    const cacheKey = `${CACHE_KEY_PREFIX}_${params.kategoria || "all"}_${page}_${pageSize}_${sort}_${JSON.stringify(params.filters)}`;
    
    // Проверяем кэш
    const cached = await getServerCache<FetchProductsResponse>(
      cacheKey,
      CACHE_VERSION
    );
    if (cached) {
      console.log(`[getProducts] Cache hit for ${cacheKey}`);
      return cached;
    }
    console.log(`[getProducts] Cache miss for ${cacheKey}, fetching from API...`);
  let targetCategoryIds: string[] = [];

  if (params.kategoria) {
    try {
      const parentCategory = await Promise.race([
        categoriesService.find({
          filters: {
            slug: params.kategoria,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000)
        ),
      ]);

      if (parentCategory.data.length > 0) {
        const categoryDocId = parentCategory.data[0].documentId;
        // Используем уже загруженные категории для оптимизации (быстро, без API запросов)
        targetCategoryIds = await getAllCategoryIds(
          categoryDocId,
          params.allCategories
        );
        
        // Проверяем, что getAllCategoryIds вернул хотя бы саму категорию
        if (targetCategoryIds.length === 0) {
          console.warn(
            `[getProducts] getAllCategoryIds returned empty array for category ${params.kategoria} (${categoryDocId}), using category ID only`
          );
          targetCategoryIds = [categoryDocId];
        }
        
        console.log(
          `[getProducts] Category ${params.kategoria} (${categoryDocId}) has ${targetCategoryIds.length} total categories (including children) for filtering`
        );
      } else {
        console.warn(
          `[getProducts] Category ${params.kategoria} not found in API`
        );
        return {
          data: [],
          meta: {
            pagination: {
              total: 0,
              page: 1,
              pageSize: 24,
              pageCount: 0,
            },
          },
        } as unknown as FetchProductsResponse;
      }

      if (params.filters?.categories?.length > 0) {
        if (Array.isArray(params.filters.categories)) {
          targetCategoryIds = params.filters.categories;
        } else targetCategoryIds = Array.from(params.filters.categories);
      }
    } catch (error) {
      console.error("Error fetching category for products:", error);
      return {
        data: [],
        meta: {
          pagination: {
            total: 0,
            page: 1,
            pageSize: 24,
            pageCount: 0,
          },
        },
      } as unknown as FetchProductsResponse;
    }
  }

  // Строим фильтр
  const filters: Record<string, unknown> = {};

  // Исключаем детали (part === true) из результатов
  filters.part = {
    $ne: true, // Показываем только товары, где part не равно true
  };

  // Фильтр по категориям
  if (targetCategoryIds.length > 0) {
    filters.kategoria = {
      documentId: {
        $in: targetCategoryIds,
      },
    };
  } else if (params.filters?.categories?.length > 0) {
    filters.kategoria = {
      documentId: {
        $in: params.filters.categories,
      },
    };
  }

  // Фильтр по цене
  if (params.filters?.minPrice || params.filters?.maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (params.filters.minPrice) {
      priceFilter.$gte = params.filters.minPrice;
    }
    if (params.filters.maxPrice) {
      priceFilter.$lte = params.filters.maxPrice;
    }
    filters.price = priceFilter;
  }

  // Фильтр по характеристикам
  // В Strapi: товар имеет связь harakteristici (oneToMany) → znacheniya-harakteristiks
  // Для фильтрации товаров по характеристикам нужно использовать правильный синтаксис Strapi
  if (
    params.filters?.attributes &&
    Object.keys(params.filters.attributes).length > 0
  ) {
    const attributeFilters: Record<string, unknown>[] = [];

    for (const [attrId, attrValue] of Object.entries(
      params.filters.attributes
    )) {
      if (attrValue.numberValues && attrValue.numberValues.length > 0) {
        // Для number: фильтруем товары, у которых есть harakteristici с нужной характеристикой и external_id
        // В Strapi для фильтрации по связанным данным нужно использовать правильный синтаксис
        console.log(
          `[getProducts] Filtering by attribute ${attrId} with ${attrValue.numberValues.length} external_ids:`,
          attrValue.numberValues.slice(0, 5),
          attrValue.numberValues.length > 5 ? "..." : ""
        );
        attributeFilters.push({
          harakteristici: {
            $and: [
              {
                harakteristica: {
                  documentId: {
                    $eq: attrId,
                  },
                },
              },
              {
                external_id: {
                  $in: attrValue.numberValues,
                },
              },
            ],
          },
        });
      } else if (attrValue.stringValues && attrValue.stringValues.length > 0) {
        // Для string и boolean (включая объединенный "Наличие"): фильтруем по external_id значений
        if (attrId === "availability") {
          // Для объединенного фильтра "Наличие" фильтруем только по external_id
          attributeFilters.push({
            harakteristici: {
              external_id: {
                $in: attrValue.stringValues,
              },
            },
          });
        } else {
          // Для обычных string фильтруем по характеристике и external_id
          attributeFilters.push({
            harakteristici: {
              $and: [
                {
                  harakteristica: {
                    documentId: {
                      $eq: attrId,
                    },
                  },
                },
                {
                  external_id: {
                    $in: attrValue.stringValues,
                  },
                },
              ],
            },
          });
        }
      } else if (
        attrValue.rangeMin !== undefined ||
        attrValue.rangeMax !== undefined
      ) {
        // Для range: фильтруем по range_min и range_max
        // Товар должен иметь характеристику, у которой диапазон пересекается с выбранным
        const rangeFilter: Record<string, unknown> = {
          harakteristici: {
            harakteristica: {
              documentId: {
                $eq: attrId,
              },
            },
          },
        };

        // Диапазон товара должен пересекаться с выбранным диапазоном
        // range_min товара <= rangeMax выбранного И range_max товара >= rangeMin выбранного
        if (
          attrValue.rangeMin !== undefined &&
          attrValue.rangeMax !== undefined
        ) {
          rangeFilter.harakteristici = {
            ...(rangeFilter.harakteristici as Record<string, unknown>),
            $and: [
              {
                harakteristica: {
                  documentId: {
                    $eq: attrId,
                  },
                },
              },
              {
                range_min: {
                  $lte: attrValue.rangeMax,
                },
              },
              {
                range_max: {
                  $gte: attrValue.rangeMin,
                },
              },
            ],
          };
        } else if (attrValue.rangeMin !== undefined) {
          rangeFilter.harakteristici = {
            ...(rangeFilter.harakteristici as Record<string, unknown>),
            range_max: {
              $gte: attrValue.rangeMin,
            },
          };
        } else if (attrValue.rangeMax !== undefined) {
          rangeFilter.harakteristici = {
            ...(rangeFilter.harakteristici as Record<string, unknown>),
            range_min: {
              $lte: attrValue.rangeMax,
            },
          };
        }

        attributeFilters.push(rangeFilter);
      }
    }

    // Если есть фильтры по характеристикам, применяем их через $and
    // Каждый фильтр означает: товар должен иметь хотя бы одну характеристику, соответствующую условию
    if (attributeFilters.length > 0) {
      if (filters.$and) {
        filters.$and = [
          ...(filters.$and as Record<string, unknown>[]),
          ...attributeFilters,
        ];
      } else {
        filters.$and = attributeFilters;
      }
    }
  }

  try {
    // Преобразуем sort в формат Strapi (например, "price:asc" -> ["price:asc"])
    const sortArray = sort ? [sort] : undefined;

    // Оптимизированный populate - загружаем только необходимые поля для списка товаров
    // Это значительно уменьшает размер ответа и ускоряет загрузку
    const res = await Promise.race([
      productsServerService.find({
        filters,
        sort: sortArray,
        pagination: {
          page,
          pageSize,
        },
        populate: {
          // Характеристики - только нужные поля для карточки товара
          harakteristici: {
            populate: {
              harakteristica: {
                fields: ["name", "type"], // Только имя и тип характеристики
              },
            },
            fields: ["string_value", "number_value", "external_id"], // Только нужные поля значения
          },
          // Категория - только базовые поля
          kategoria: {
            fields: ["name", "slug", "documentId"], // Только нужные поля категории
          },
          // Изображения - загружаем все, но используем только первые 2 на клиенте
          // Ограничение через pagination в populate может не работать в Strapi SDK
          pathsImgs: {
            fields: ["path"], // Только путь к изображению
          },
          // price_history не загружаем для списка - не используется в карточке
          // reviews и asks не загружаем для списка - они используются только на странице товара
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      ),
    ]);

    const result = res as unknown as FetchProductsResponse;
    
    // Сохраняем в кэш асинхронно (не блокируем ответ)
    setServerCache(cacheKey, result, CACHE_TTL, CACHE_VERSION).catch((error) => {
      console.warn(`[getProducts] Failed to cache result for ${cacheKey}:`, error);
    });
    
    return result;
  } catch (error) {
    // Обрабатываем разные типы ошибок
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Игнорируем ошибки "aborted" - они возникают при отмене запросов Next.js
    if (
      errorMessage.toLowerCase().includes("aborted") ||
      errorMessage.toLowerCase().includes("abort") ||
      errorName === "AbortError" ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      console.warn("[getProducts] Request was aborted, returning empty result");
      return {
        data: [],
        meta: {
          pagination: {
            total: 0,
            page,
            pageSize,
            pageCount: 0,
          },
        },
      } as unknown as FetchProductsResponse;
    }
    
    // Для таймаутов возвращаем пустой результат
    if (errorMessage.toLowerCase().includes("timeout")) {
      console.warn("[getProducts] Request timeout, returning empty result");
      return {
        data: [],
        meta: {
          pagination: {
            total: 0,
            page,
            pageSize,
            pageCount: 0,
          },
        },
      } as unknown as FetchProductsResponse;
    }
    
    console.error("Error fetching products:", error);
    // Возвращаем пустой результат вместо ошибки
    return {
      data: [],
      meta: {
        pagination: {
          total: 0,
          page: params.page || 1,
          pageSize: params.pageSize || 24,
          pageCount: 0,
        },
      },
    } as unknown as FetchProductsResponse;
  }
  }
);

/**
 * Получить товар по slug (server-side, напрямую к Strapi)
 * Используется только в server components для SSR
 */
export async function getProductsBySlug(
  documentId: string
): Promise<ProductType> {
  const res = await productsServerService.find({
    filters: {
      slug: {
        $eq: documentId,
      },
    },
    populate: {
      harakteristici: { populate: "*" },
      kategoria: { populate: "*" },
      pathsImgs: { populate: "*" },
      reviews: {
        populate: {
          buyer: { populate: "*" },
          files: { populate: "*" },
        },
      },
      asks: {
        populate: {
          buyer: { populate: "*" },
        },
      },
    },
  });

  return res.data[0] as unknown as ProductType;
}

/**
 * Получить товары по массиву slugs (server-side, напрямую к Strapi)
 * Используется только в server components для SSR
 */
export async function getProductsBySlugs(
  slugs: string[]
): Promise<ProductType[]> {
  if (slugs.length === 0) {
    return [];
  }

  const res = await productsServerService.find({
    filters: {
      slug: {
        $in: slugs,
      },
      part: {
        $ne: true,
      },
    },
    populate: {
      harakteristici: { populate: "*" },
      kategoria: { populate: "*" },
      pathsImgs: { populate: "*" },
      reviews: {
        populate: {
          buyer: { populate: "*" },
          files: { populate: "*" },
        },
      },
      asks: {
        populate: {
          buyer: { populate: "*" },
        },
      },
    },
  });

  return res.data as unknown as ProductType[];
}

/**
 * Получить все slugs товаров для generateStaticParams
 * Используется для статической генерации страниц товаров
 */
export async function getAllProductSlugs(): Promise<string[]> {
  try {
    // Получаем все товары (только slug) с пагинацией
    // Используем большой pageSize, чтобы получить все товары за один запрос
    const res = await Promise.race([
      productsServerService.find({
        filters: {
          part: {
            $ne: true,
          },
        },
        fields: ["slug"], // Получаем только slug для оптимизации
        pagination: {
          page: 1,
          pageSize: 10000, // Большой размер для получения всех товаров
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      ),
    ]);

    const products = res.data as unknown as Array<{ slug: string }>;
    return products
      .map((product) => product.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch (error) {
    console.error("[getAllProductSlugs] Error:", error);
    return [];
  }
}

/**
 * Получить популярные товары из указанных категорий
 * Получает до 5 товаров из каждой категории (со всеми дочерними) и перемешивает их
 */
export async function getPopularProducts(): Promise<ProductType[]> {
  // Захардкоженные категории для популярных товаров
  const categorySlugs = [
    "gorizontal-nye-upakovochnye-mashiny",
    "vakuumnye-upakovschiki",
  ];

  const allProducts: ProductType[] = [];

  try {
    // Получаем товары из каждой категории
    for (const categorySlug of categorySlugs) {
      try {
        // Получаем родительскую категорию
        const parentCategory = await Promise.race([
          categoriesService.find({
            filters: {
              slug: categorySlug,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 10000)
          ),
        ]);

        if (parentCategory.data.length === 0) {
          console.warn(
            `[getPopularProducts] Category ${categorySlug} not found`
          );
          continue;
        }

        // Получаем все ID категорий (включая дочерние)
        const categoryDocId = parentCategory.data[0].documentId;
        const categoryIds = await getAllCategoryIds(categoryDocId);

        if (categoryIds.length === 0) {
          continue;
        }

        // Получаем до 5 товаров из этой категории
        const productsRes = await Promise.race([
          productsServerService.find({
            filters: {
              kategoria: {
                documentId: {
                  $in: categoryIds,
                },
              },
              part: {
                $ne: true,
              },
            },
            pagination: {
              page: 1,
              pageSize: 5,
            },
            populate: {
              harakteristici: { populate: "*" },
              kategoria: { populate: "*" },
              pathsImgs: { populate: "*" },
              reviews: {
                populate: {
                  buyer: { populate: "*" },
                  files: { populate: "*" },
                },
              },
              asks: {
                populate: {
                  buyer: { populate: "*" },
                },
              },
            },
            sort: ["name:asc"], // Добавляем сортировку для стабильности
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 10000)
          ),
        ]);

        const products = productsRes.data as unknown as ProductType[];
        allProducts.push(...products);
      } catch (error) {
        console.error(
          `[getPopularProducts] Error fetching products for category ${categorySlug}:`,
          error
        );
        // Продолжаем работу даже если одна категория не загрузилась
      }
    }

    // Перемешиваем товары рандомно
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5);

    return shuffled;
  } catch (error) {
    console.error("[getPopularProducts] Error:", error);
    return [];
  }
}
