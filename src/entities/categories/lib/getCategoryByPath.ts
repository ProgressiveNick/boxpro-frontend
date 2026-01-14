import { Category } from "../model";
import { categoriesService } from "@/shared/api/server";
import { cache } from "react";
import { getCatalogMenu } from "../api/getCatalogMenu";
import { CategoryTree } from "./CategoryTree";

/**
 * Получить категорию по полному пути (массив slug'ов)
 * @param slugs - массив slug'ов от корня до категории
 * @returns категория или null
 */
export const getCategoryByPath = cache(
  async (slugs: string[]): Promise<Category | null> => {
    if (!slugs || slugs.length === 0) {
      return null;
    }

    try {
      // Загружаем все категории из меню для построения пути (используем кэш)
      const allCategories = await getCatalogMenu();
      const tree = new CategoryTree(allCategories);

      // Пытаемся найти категорию по пути
      let category = tree.getByPath(slugs);

      // Если категория не найдена в меню, загружаем её напрямую из API
      if (!category) {
        const targetSlug = slugs[slugs.length - 1];
        console.warn(`[getCategoryByPath] Category not found in menu, fetching from API: ${targetSlug}`);
        
        try {
          const categoryResponse = await Promise.race([
            categoriesService.find({
              filters: {
                slug: {
                  $eq: targetSlug,
                },
              },
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
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 5000)
            ),
          ]);

          const fetchedCategory = categoryResponse.data?.[0];
          if (fetchedCategory) {
            category = fetchedCategory as unknown as Category;
            
            // Проверяем путь для загруженной категории
            // Создаем временный tree с добавленной категорией
            const extendedTree = new CategoryTree([...allCategories, category]);
            const actualPath = extendedTree.getPath(category);
            const expectedPath = slugs;

            if (actualPath.length !== expectedPath.length) {
              console.warn(
                `[getCategoryByPath] Path length mismatch. Expected: ${expectedPath.join("/")}, Actual: ${actualPath.join("/")}`
              );
              return null;
            }

            // Проверяем, что каждый slug совпадает
            for (let i = 0; i < expectedPath.length; i++) {
              if (actualPath[i] !== expectedPath[i]) {
                console.warn(
                  `[getCategoryByPath] Path mismatch. Expected: ${expectedPath.join("/")}, Actual: ${actualPath.join("/")}`
                );
                return null;
              }
            }
          } else {
            console.warn(`[getCategoryByPath] Category not found in API: ${targetSlug}`);
            return null;
          }
        } catch (error) {
          console.error(`[getCategoryByPath] Error fetching category from API:`, error);
          return null;
        }
      }

      return category;
    } catch (error) {
      console.error("Error fetching category by path:", error);
      return null;
    }
  }
);

