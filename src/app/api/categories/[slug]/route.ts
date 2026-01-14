import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

type Params = Promise<{ slug: string }>;

// GET /api/categories/[slug] - Получить категорию по slug
export async function GET(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const searchParams = request.nextUrl.searchParams;
    const includeChildren = searchParams.get("includeChildren") !== "false";

    const strapiParams: Record<string, string> = {
      "filters[slug][$eq]": slug,
      "publicationState": "live",
      "populate": "*",
    };

    if (includeChildren) {
      strapiParams["populate[childs]"] = "*";
      strapiParams["populate[childs][populate]"] = "*";
      strapiParams["populate[parent]"] = "*";
    }

    const result = await getStrapiRecords("kategorii-tovarovs", strapiParams);

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.data[0] }, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения категории:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

