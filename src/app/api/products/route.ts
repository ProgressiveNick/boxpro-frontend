import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";
import { SPARE_PARTS_CATEGORY_SLUG } from "@/shared/lib/catalog-constants";

// GET /api/products - Получить список товаров
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Параметры пагинации
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "24";

    // Параметры фильтрации
    const categorySlug = searchParams.get("categorySlug");
    const categories = searchParams.getAll("categories");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const includePartsParam = searchParams.get("includeParts");

    // Параметры сортировки
    const sort = searchParams.get("sort") || "name:asc";

    // В разделе запасных частей показываем part=true; иначе — только оборудование
    const includeParts =
      includePartsParam === "true" ||
      categorySlug === SPARE_PARTS_CATEGORY_SLUG;

    // Строим параметры для Strapi
    const params: Record<string, string> = {
      publicationState: "live",
      populate: "*",
      "pagination[page]": page,
      "pagination[pageSize]": pageSize,
      sort: sort,
    };

    if (includeParts) {
      params["filters[part][$eq]"] = "true";
    } else {
      params["filters[part][$ne]"] = "true";
    }

    // Фильтры
    if (categorySlug) {
      params["filters[kategoria][slug][$eq]"] = categorySlug;
    }

    if (categories.length > 0) {
      categories.forEach((cat, index) => {
        params[`filters[kategoria][documentId][$in][${index}]`] = cat;
      });
    }

    if (minPrice) {
      params["filters[price][$gte]"] = minPrice;
    }

    if (maxPrice) {
      params["filters[price][$lte]"] = maxPrice;
    }

    if (search) {
      params["filters[$or][0][name][$contains]"] = search;
      params["filters[$or][1][description][$contains]"] = search;
      params["filters[$or][2][slug][$contains]"] = search;
    }

    const result = await getStrapiRecords("tovaries", params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения товаров:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
