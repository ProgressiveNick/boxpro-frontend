import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

// GET /api/categories - Получить список категорий
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Параметры
    const populate = searchParams.get("populate") || "*";
    const includeChildren = searchParams.get("includeChildren") === "true";
    const parentSlug = searchParams.get("parentSlug");

    const params: Record<string, string> = {
      "publicationState": "live",
      "populate": populate,
    };

    if (includeChildren) {
      params["populate[childs]"] = "*";
      params["populate[parent]"] = "*";
    }

    if (parentSlug) {
      params["filters[parent][slug][$eq]"] = parentSlug;
    }

    const result = await getStrapiRecords("kategorii-tovarovs", params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения категорий:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

