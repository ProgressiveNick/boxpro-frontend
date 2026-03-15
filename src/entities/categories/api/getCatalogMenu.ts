import { cache } from "react";
import { Category } from "../model";
import { getServerCache, setServerCache } from "@/shared/lib/server-cache";
import { categoriesService } from "@/shared/api/server";
import { CategoryTree } from "../lib/CategoryTree";
import {
  getCategoryMap,
  getTreeForMenu,
  getAllPathsFromMap,
} from "../lib/categoryMap";

const CACHE_KEY = "catalog_menu";
const CACHE_VERSION = "1.1"; // Версия кэша, можно увеличивать при изменении структуры (обновлено для загрузки img_menu у вложенных категорий)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

/**
 * Получить структуру каталога: приоритет — статическая карта (public/data/category-map.json), иначе API + серверный кэш.
 */
export const getCatalogMenu = cache(async (): Promise<Category[]> => {
  const map = await getCategoryMap();
  if (map && map.tree.length > 0) {
    return getTreeForMenu(map);
  }

  const cached = await getServerCache<Category[]>(CACHE_KEY, CACHE_VERSION);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const data = await getCatalogMenuFromAPI();
  setServerCache(CACHE_KEY, data, CACHE_TTL, CACHE_VERSION).catch((error) => {
    console.warn("Failed to cache catalog menu:", error);
  });

  return data;
});

/**
 * Запрос к API для получения структуры каталога
 */
async function getCatalogMenuFromAPI(): Promise<Category[]> {
  try {
    // Загружаем корневые категории (где parent is null) с полной структурой
    // Включаем populate для childs (рекурсивно) и parent (для дочерних категорий)
    // Это нужно для правильного построения путей вложенности
    const data = await Promise.race([
      categoriesService.find({
        filters: {
          parent: {
            $null: true,
          },
        },
        populate: {
          childs: {
            populate: {
              parent: {
                populate: {
                  parent: {
                    populate: {
                      parent: {
                        populate: "*",
                      },
                    },
                  },
                },
              },
              img_menu: {
                populate: "*",
              },
              childs: {
                populate: {
                  img_menu: {
                    populate: "*",
                  },
                  childs: {
                    populate: {
                      img_menu: {
                        populate: "*",
                      },
                      childs: {
                        populate: {
                          img_menu: {
                            populate: "*",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          img_menu: {
            populate: "*",
          },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 10000)
      ),
    ]);

    return data.data as unknown as Category[];
  } catch (error) {
    // Обрабатываем ошибки авторизации и другие ошибки API
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "";
    
    // Если ошибка авторизации (401), логируем и возвращаем пустой массив
    if (
      errorMessage.includes("401") ||
      errorMessage.includes("Unauthorized") ||
      errorName.includes("HTTPAuthorizationError")
    ) {
      console.error("[getCatalogMenuFromAPI] Strapi API authorization error:", errorMessage);
      console.error("This may happen during Docker build if Strapi API is not accessible");
      return [];
    }
    
    // Для других ошибок также возвращаем пустой массив
    console.error("[getCatalogMenuFromAPI] Error fetching catalog menu:", error);
    return [];
  }
}

/**
 * Получить все пути категорий для generateStaticParams.
 * При наличии карты — из неё, иначе из getCatalogMenu + CategoryTree.
 */
export async function getAllCategoryPaths(): Promise<string[][]> {
  const map = await getCategoryMap();
  if (map && map.tree.length > 0) {
    return getAllPathsFromMap(map);
  }
  const allCategories = await getCatalogMenu();
  const tree = new CategoryTree(allCategories);
  return tree.getAllPaths();
}
