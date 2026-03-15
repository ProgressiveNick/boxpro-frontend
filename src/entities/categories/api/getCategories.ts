import { categoriesService } from "@/shared/api/server";
import { cache } from "react";
import { Category } from "../model";
import { CategoryTree } from "../lib/CategoryTree";
import {
  getCategoryMap,
  getChildDocumentIds,
  getDocumentIdBySlug,
  getChildCategoriesFromMap,
} from "../lib/categoryMap";

const categoryIdsCache = new Map<string, string[]>();

export function clearCategoryIdsCache() {
  categoryIdsCache.clear();
}

/**
 * Получить все ID дочерних категорий (включая саму категорию).
 * При наличии карты — getChildDocumentIds, иначе CategoryTree или API.
 */
export const getAllCategoryIds = cache(
  async (
    categoryId: string,
    allCategories?: Category[]
  ): Promise<string[]> => {
    if (categoryIdsCache.has(categoryId)) {
      return categoryIdsCache.get(categoryId)!;
    }

    const map = await getCategoryMap();
    if (map && map.byDocumentId[categoryId]) {
      const ids = getChildDocumentIds(map, categoryId);
      categoryIdsCache.set(categoryId, ids);
      return ids;
    }

    if (allCategories && allCategories.length > 0) {
      const tree = new CategoryTree(allCategories);
      const category = tree.getById(categoryId);
      if (category) {
        const categoryIds = tree.getAllChildIds(categoryId);
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
          // API fallback
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
      const map = await getCategoryMap();
      if (map && map.tree.length > 0) {
        const parentId = getDocumentIdBySlug(map, categorSlug);
        if (parentId) {
          return getChildCategoriesFromMap(map, parentId);
        }
      }

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
