import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

// GET /api/attributes - Получить список характеристик
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const populate = searchParams.get("populate") || "values";

    const params: Record<string, string> = {
      "publicationState": "live",
    };

    if (populate === "values") {
      params["populate[values]"] = "*";
    } else if (populate === "*") {
      params["populate"] = "*";
    }

    const result = await getStrapiRecords("harakteristiki-tovarovs", params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения характеристик:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

