import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

type Params = Promise<{ slug: string }>;

// GET /api/products/[slug] - Получить товар по slug
export async function GET(
  request: NextRequest,
  props: { params: Params }
) {
  try {
    const params = await props.params;
    const slug = params.slug;

    const result = await getStrapiRecords("tovaries", {
      "filters[slug][$eq]": slug,
      "populate[harakteristici][populate]": "*",
      "populate[kategoria][populate]": "*",
      "populate[pathsImgs]": "*",
      "publicationState": "live",
    });

    if (!result.data || result.data.length === 0) {
      return NextResponse.json(
        { error: "Товар не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result.data[0] }, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения товара:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

