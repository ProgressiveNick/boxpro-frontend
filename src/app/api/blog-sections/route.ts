import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

// GET /api/blog-sections - Получить список разделов блога
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const populate = searchParams.get("populate") || "articles";

    const params: Record<string, string> = {
      "publicationState": "live",
    };

    if (populate === "articles") {
      params["populate[articles]"] = "*";
      params["populate[articles][populate]"] = "*";
    } else if (populate === "*") {
      params["populate"] = "*";
    }

    const result = await getStrapiRecords("blog-sections", params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения разделов блога:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

