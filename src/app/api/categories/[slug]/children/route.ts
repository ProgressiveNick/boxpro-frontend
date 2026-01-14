import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";
import { getAllCategoryIds } from "@/entities/categories/api/getCategories";
import { categoriesService } from "@/shared/api/server";

type Params = Promise<{ slug: string }>;

// GET /api/categories/[slug]/children - Получить все дочерние категории (рекурсивно)
export async function GET(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const slug = params.slug;

    // Получаем родительскую категорию
    const parentCategory = await categoriesService.find({
      filters: {
        slug: { $eq: slug },
      },
    });

    if (parentCategory.data.length === 0) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    const parentId = parentCategory.data[0].documentId;

    // Получаем все ID дочерних категорий (рекурсивно)
    const categoryIds = await getAllCategoryIds(parentId);

    // Получаем все категории по ID
    // Строим параметры для фильтрации по documentId
    const filterParams: Record<string, string> = {
      "publicationState": "live",
      "populate": "*",
      "populate[childs]": "*",
      "populate[parent]": "*",
    };

    // Добавляем фильтр по documentId для каждой категории
    categoryIds.forEach((id, index) => {
      filterParams[`filters[documentId][$in][${index}]`] = id;
    });

    const result = await getStrapiRecords("kategorii-tovarovs", filterParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения дочерних категорий:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

