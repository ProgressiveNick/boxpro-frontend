import { getAllCategoryIds } from "@/entities/categories/api/getCategories";
import { getCategoryMap, getDocumentIdBySlug } from "@/entities/categories/lib/categoryMap";
import { AttributeValue } from "@/entities/product-attributes";
import { attributesServerService } from "@/shared/api/server";

type GetAllProductsAttributesParams = {
  categoriesIds?: string[];
  pageSize?: number;
};

type AtributesResponse = {
  data: AttributeValue[];
  meta: {
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
};

export async function getAllProductsAttributes({
  categoriesIds,
  pageSize = 100,
}: GetAllProductsAttributesParams = {}): Promise<AttributeValue[]> {
  const allAtributes: AttributeValue[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    try {
      const filters: Record<string, unknown> = {};

      if (categoriesIds && categoriesIds.length > 0) {
        filters.tovary = {
          kategoria: {
            documentId: {
              $eq: categoriesIds,
            },
          },
          // Исключаем детали (part === true) из результатов
          part: {
            $ne: true,
          },
        };
      } else {
        // Исключаем детали (part === true) из результатов
        filters.tovary = {
          part: {
            $ne: true,
          },
        };
      }

      const response = (await attributesServerService.find({
        filters,

        pagination: {
          page: currentPage,
          pageSize,
        },
        populate: {
          harakteristica: { populate: "*" },
        },
      })) as unknown as AtributesResponse;

      const { data, meta } = response;

      allAtributes.push(...data);

      // Проверяем, есть ли еще страницы
      hasMorePages = currentPage < meta.pagination.pageCount;
      currentPage++;
    } catch (error) {
      console.error("Ошибка при получении атрибутов продуктов:", error);
      throw error;
    }
  }

  return allAtributes;
}

export async function getAllAttributes({
  categoriesIds,
  pageSize = 100,
}: GetAllProductsAttributesParams = {}): Promise<AttributeValue[]> {
  const allAtributes: AttributeValue[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  let targetCategoryIds: string[] = [];

  if (categoriesIds?.length) {
    const map = await getCategoryMap();
    const firstSlug = Array.isArray(categoriesIds) ? categoriesIds[0] : categoriesIds;
    const documentId = map ? getDocumentIdBySlug(map, firstSlug) : null;
    if (documentId) {
      targetCategoryIds = await getAllCategoryIds(documentId);
    }
  }

  while (hasMorePages) {
    try {
      const filters: Record<string, unknown> = {};

      if (categoriesIds && categoriesIds.length > 0) {
        filters.tovary = {
          kategoria: {
            documentId: {
              $in: targetCategoryIds,
            },
          },
          // Исключаем детали (part === true) из результатов
          part: {
            $ne: true,
          },
        };
      } else {
        // Исключаем детали (part === true) из результатов
        filters.tovary = {
          part: {
            $ne: true,
          },
        };
      }

      const response = (await attributesServerService.find({
        filters,
        pagination: {
          page: currentPage,
          pageSize,
        },
        // populate: {
        //     values: { populate: ["*"] },
        // },
      })) as unknown as AtributesResponse;

      const { data, meta } = response;

      for (const item of data) {
        allAtributes.push(item);
      }
      // allAtributes.push(...data);

      // Проверяем, есть ли еще страницы
      hasMorePages = currentPage < meta.pagination.pageCount;
      currentPage++;
    } catch (error) {
      console.error("Ошибка при получении атрибутов продуктов:", error);
      throw error;
    }
  }

  return allAtributes;
}
