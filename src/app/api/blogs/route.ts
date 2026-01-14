import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

// GET /api/blogs - Получить список статей блога
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Параметры пагинации
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "12";

    // Параметры фильтрации
    const sectionSlug = searchParams.get("sectionSlug");
    const search = searchParams.get("search");

    // Параметры сортировки
    const sort = searchParams.get("sort") || "publish_date:desc";

    const params: Record<string, string> = {
      "publicationState": "live",
      "populate": "*",
      "populate[blog_sections]": "*",
      "populate[preview]": "*",
      "pagination[page]": page,
      "pagination[pageSize]": pageSize,
      "sort": sort,
    };

    if (sectionSlug) {
      params["filters[blog_sections][slug][$eq]"] = sectionSlug;
    }

    if (search) {
      params["filters[$or][0][name][$contains]"] = search;
      params["filters[$or][1][description][$contains]"] = search;
      params["filters[$or][2][article][$contains]"] = search;
    }

    const result = await getStrapiRecords("blogs", params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения статей блога:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

