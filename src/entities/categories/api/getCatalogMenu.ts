import { cache } from "react";
import { Category } from "../model";
import { getServerCache, setServerCache } from "@/shared/lib/server-cache";
import { categoriesService } from "@/shared/api/server";
import { CategoryTree } from "../lib/CategoryTree";

const CACHE_KEY = "catalog_menu";
const CACHE_VERSION = "1.0"; // Версия кэша, можно увеличивать при изменении структуры
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

/**
 * Получить структуру каталога с серверным кэшированием
 * Использует файловый кэш на сервере для оптимизации производительности
 */
export const getCatalogMenu = cache(async (): Promise<Category[]> => {
  // Проверяем кэш на сервере
  const cached = await getServerCache<Category[]>(CACHE_KEY, CACHE_VERSION);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  // Если в кэше нет, делаем запрос к API
  const data = await getCatalogMenuFromAPI();

  // Сохраняем в кэш асинхронно (не блокируем ответ)
  setServerCache(CACHE_KEY, data, CACHE_TTL, CACHE_VERSION).catch((error) => {
    console.warn("Failed to cache catalog menu:", error);
  });

  return data;
});

/**
 * Запрос к API для получения структуры каталога
 */
async function getCatalogMenuFromAPI(): Promise<Category[]> {
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
            childs: {
              populate: "*",
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
}

/**
 * Получить все пути категорий для generateStaticParams
 * Используется для статической генерации страниц категорий
 * @returns массив массивов slug'ов (пути категорий)
 */
export async function getAllCategoryPaths(): Promise<string[][]> {
  const allCategories = await getCatalogMenu();
  const tree = new CategoryTree(allCategories);
  return tree.getAllPaths();
}
