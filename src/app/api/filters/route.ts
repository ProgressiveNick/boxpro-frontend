import { NextRequest, NextResponse } from "next/server";
import { getAllCategoryIds } from "@/entities/categories/api/getCategories";
import {
  categoriesService,
  attributesValuesServerService,
} from "@/shared/api/server";
import { SPARE_PARTS_CATEGORY_SLUG } from "@/shared/lib/catalog-constants";

// GET /api/filters - Получить все уникальные фильтры для категории (характеристики и их значения)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("categorySlug");
    const includePartsParam = searchParams.get("includeParts");
    const includeParts =
      includePartsParam === "true" ||
      categorySlug === SPARE_PARTS_CATEGORY_SLUG;

    // Если указана категория, получаем все дочерние категории
    let targetCategoryIds: string[] = [];

    if (categorySlug) {
      const parentCategory = await categoriesService.find({
        filters: {
          slug: { $eq: categorySlug },
        },
      });

      if (parentCategory.data.length > 0) {
        targetCategoryIds = await getAllCategoryIds(
          parentCategory.data[0].documentId,
        );
      }
    }

    // Получаем все значения характеристик для товаров в этих категориях
    type AttributeValue = {
      documentId?: string;
      id?: number;
      harakteristica?: {
        documentId?: string;
        id?: number;
        name?: string;
        type?: string;
        unit?: string | null;
      };
      string_value?: string | null;
      number_value?: number | null;
      boolean_value?: boolean | null;
      range_min?: number;
      range_max?: number;
      comment?: string;
    };
    const allAttributes: AttributeValue[] = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const filters: Record<string, unknown> = {};

      if (targetCategoryIds.length > 0) {
        filters.tovary = {
          kategoria: {
            documentId: {
              $in: targetCategoryIds,
            },
          },
          ...(includeParts ? { part: { $eq: true } } : { part: { $ne: true } }),
        };
      } else {
        filters.tovary = {
          ...(includeParts ? { part: { $eq: true } } : { part: { $ne: true } }),
        };
      }

      const response = await attributesValuesServerService.find({
        filters,
        pagination: {
          page: currentPage,
          pageSize: 100,
        },
        populate: {
          harakteristica: { populate: "*" },
          tovary: { populate: ["kategoria"] },
        },
      });

      allAttributes.push(...response.data);

      hasMorePages = currentPage < (response.meta?.pagination?.pageCount || 0);
      currentPage++;
    }

    // Группируем значения по характеристикам и собираем уникальные значения
    const filtersMap = new Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        unit: string | null;
        values: Array<{
          id: string;
          value: string | number | boolean;
          stringValue?: string;
          numberValue?: number;
          booleanValue?: boolean;
          rangeMin?: number;
          rangeMax?: number;
          comment?: string;
        }>;
      }
    >();

    allAttributes.forEach((attr) => {
      if (!attr.harakteristica) return;

      const charId =
        attr.harakteristica.documentId || String(attr.harakteristica.id);
      if (!charId) return;

      const charName = attr.harakteristica.name || "";
      const charType = attr.harakteristica.type || "";
      const charUnit = attr.harakteristica.unit || null;

      if (!filtersMap.has(charId)) {
        filtersMap.set(charId, {
          id: charId,
          name: charName,
          type: charType,
          unit: charUnit,
          values: [],
        });
      }

      const filter = filtersMap.get(charId)!;
      const valueId = attr.documentId || String(attr.id) || "";

      // Определяем значение в зависимости от типа
      let value: string | number | boolean | undefined;
      if (attr.string_value !== null && attr.string_value !== undefined) {
        value = attr.string_value;
      } else if (
        attr.number_value !== null &&
        attr.number_value !== undefined
      ) {
        value = attr.number_value;
      } else if (
        attr.boolean_value !== null &&
        attr.boolean_value !== undefined
      ) {
        value = attr.boolean_value;
      }

      // Проверяем, нет ли уже такого значения
      const existingValue = filter.values.find(
        (v) =>
          v.stringValue === attr.string_value &&
          v.numberValue === attr.number_value &&
          v.booleanValue === attr.boolean_value,
      );

      if (!existingValue && value !== undefined) {
        filter.values.push({
          id: valueId,
          value,
          stringValue: attr.string_value ?? undefined,
          numberValue: attr.number_value ?? undefined,
          booleanValue: attr.boolean_value ?? undefined,
          rangeMin: attr.range_min,
          rangeMax: attr.range_max,
          comment: attr.comment,
        });
      }
    });

    // Преобразуем Map в массив
    const filters = Array.from(filtersMap.values());

    return NextResponse.json({ data: filters }, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения фильтров:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
