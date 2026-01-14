import { categoriesService } from "@/shared/api/server";
import { cache } from "react";
import { Category } from "../model";
import { CategoryTree } from "../lib/CategoryTree";

// Кэш для getAllCategoryIds чтобы не делать повторные запросы
// Очищаем кэш при необходимости
const categoryIdsCache = new Map<string, string[]>();

// Функция для очистки кэша (можно вызвать при необходимости)
export function clearCategoryIdsCache() {
  categoryIdsCache.clear();
}

/**
 * Получить все ID дочерних категорий (оптимизированная версия с использованием CategoryTree)
 * @param categoryId - documentId родительской категории
 * @param allCategories - опционально: уже загруженные категории из getCatalogMenu
 * @returns массив documentId всех дочерних категорий (включая саму категорию)
 */
export const getAllCategoryIds = cache(
  async (
    categoryId: string,
    allCategories?: Category[]
  ): Promise<string[]> => {
    // Проверяем кэш
    if (categoryIdsCache.has(categoryId)) {
      const cached = categoryIdsCache.get(categoryId)!;
      console.log(
        `[getAllCategoryIds] Cache hit for ${categoryId}: ${cached.length} categories`
      );
      return cached;
    }

    // Если переданы уже загруженные категории, используем CategoryTree (быстро, без API запросов)
    if (allCategories && allCategories.length > 0) {
      const tree = new CategoryTree(allCategories);
      
      // Проверяем, что категория действительно найдена в дереве
      const category = tree.getById(categoryId);
      
      if (!category) {
        // Категория не найдена в дереве, используем fallback на API
        console.log(
          `[getAllCategoryIds] Category ${categoryId} not found in CategoryTree, using API fallback`
        );
        // Продолжаем выполнение ниже (fallback на API)
      } else {
        // Категория найдена в дереве, получаем все дочерние категории
        const categoryIds = tree.getAllChildIds(categoryId);
        console.log(
          `[getAllCategoryIds] Using CategoryTree for ${categoryId}: ${categoryIds.length} categories (fast, no API calls)`
        );
        // Сохраняем в кэш
        categoryIdsCache.set(categoryId, categoryIds);
        return categoryIds;
      }
    }

    // Fallback: рекурсивные запросы к API (медленно, но работает везде)
    const categoryIds = [categoryId]; // Начинаем с ID родительской категории

    // Функция для рекурсивного получения дочерних категорий
    async function getChildren(parentId: string, level: number = 0) {
      try {
        const children = await Promise.race([
          categoriesService.find({
            filters: {
              parent: {
                documentId: {
                  $eq: parentId,
                },
              },
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 5000)
          ),
        ]);

        for (const child of children.data) {
          if (!categoryIds.includes(child.documentId)) {
            categoryIds.push(child.documentId);
            await getChildren(child.documentId, level + 1); // Рекурсивно для дочерних категорий
          }
        }

        if (children.data.length > 0 && level === 0) {
          console.log(
            `[getAllCategoryIds] Found ${children.data.length} direct children for category ${parentId} (API fallback)`
          );
        }
      } catch (error) {
        console.warn(
          `[getAllCategoryIds] Error fetching children for category ${parentId}:`,
          error
        );
        // Продолжаем работу даже если один запрос не удался
      }
    }

    await getChildren(categoryId);

    console.log(
      `[getAllCategoryIds] Total categories (including children) for ${categoryId}: ${categoryIds.length} (API fallback)`
    );

    // Сохраняем в кэш
    categoryIdsCache.set(categoryId, categoryIds);

    return categoryIds;
  }
);

export const getChildsCategory = cache(
  async (
    categorSlug: string,
    allCategories?: Category[]
  ): Promise<Category[]> => {
    if (!categorSlug) {
      return [];
    }

    try {
      // Если переданы уже загруженные категории, используем CategoryTree (быстро, без API запросов)
      if (allCategories && allCategories.length > 0) {
        const tree = new CategoryTree(allCategories);
        const category = tree.getBySlug(categorSlug);

        if (!category || !category.documentId) {
          // Категория не найдена в дереве, используем fallback на API
          console.log(
            `[getChildsCategory] Category ${categorSlug} not found in CategoryTree, using API fallback`
          );
          // Продолжаем выполнение ниже (fallback на API)
        } else {
          // Категория найдена в дереве, получаем все ID дочерних категорий через CategoryTree
          const targetCategoryIds = tree.getAllChildIds(category.documentId);

          // Исключаем саму категорию из результата (нужны только дочерние)
          const childIds = targetCategoryIds.filter((id) => id !== category.documentId);

          if (childIds.length === 0) {
            // Нет дочерних категорий - это нормально, возвращаем пустой массив
            console.log(
              `[getChildsCategory] Category ${categorSlug} has no child categories`
            );
            return [];
          }

          // Извлекаем категории из уже загруженных данных
          const childCategories = childIds
            .map((id) => tree.getById(id))
            .filter((cat): cat is Category => cat !== undefined);

          console.log(
            `[getChildsCategory] Using CategoryTree for ${categorSlug}: ${childCategories.length} categories (fast, no API calls)`
          );

          return childCategories;
        }
      }

      // Fallback: запросы к API (медленно, но работает везде)
      // Получаем родительскую категорию с таймаутом
      const parentCategory = await Promise.race([
        categoriesService.find({
          filters: {
            slug: categorSlug,
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 10000)
        ),
      ]);

      if (!parentCategory.data?.length) {
        return [];
      }

      // Получаем все ID категорий (с кэшированием)
      const targetCategoryIds = await getAllCategoryIds(
        parentCategory.data[0].documentId
      );

      if (targetCategoryIds.length === 0) {
        return [];
      }

      // Получаем категории с таймаутом, включая информацию о родителе
      const data = await Promise.race([
        categoriesService.find({
          filters: {
            documentId: {
              $in: targetCategoryIds,
            },
          },
          populate: {
            parent: {
              populate: "*",
            },
            childs: {
              populate: "*",
            },
          },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 15000)
        ),
      ]);

      return data.data as unknown as Category[];
    } catch (error) {
      // Обрабатываем разные типы ошибок
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : "";

      // Игнорируем ошибки "aborted" и "timeout" - они возникают при отмене запросов Next.js
      if (
        errorMessage.toLowerCase().includes("aborted") ||
        errorMessage.toLowerCase().includes("abort") ||
        errorName === "AbortError" ||
        (error instanceof DOMException && error.name === "AbortError") ||
        errorMessage.toLowerCase().includes("timeout")
      ) {
        // Не логируем как ошибку - это нормальное поведение при отмене запросов
        return [];
      }

      // Для других ошибок логируем предупреждение
      console.warn("Error fetching child categories:", error);
      return [];
    }
  }
);

export const getCategory = cache(async (slug: string): Promise<Category[]> => {
  try {
    const data = await Promise.race([
      categoriesService.find({
        filters: {
          slug: {
            $eq: slug,
          },
        },
        populate: {
          childs: {
            populate: "*",
          },
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000)
      ),
    ]);
    return data.data as unknown as Category[];
  } catch (error) {
    console.error("Error fetching category:", error);
    return [];
  }
});
