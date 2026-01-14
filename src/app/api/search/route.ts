import { NextRequest, NextResponse } from "next/server";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

// GET /api/search - Поиск по товарам и блогу
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, products, blogs
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "24";

    if (!query) {
      return NextResponse.json(
        { error: "Параметр поиска 'q' обязателен" },
        { status: 400 }
      );
    }

    const results: {
      products?: unknown;
      blogs?: unknown;
    } = {};

    // Поиск по товарам
    if (type === "all" || type === "products") {
      const productsResult = await getStrapiRecords("tovaries", {
        "publicationState": "live",
        "populate": "*",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "filters[part][$ne]": "true", // Исключаем детали (показываем только товары, где part !== true)
        "filters[$or][0][name][$contains]": query,
        "filters[$or][1][description][$contains]": query,
        "filters[$or][2][slug][$contains]": query,
        "sort": "name:asc",
      });
      results.products = productsResult;
    }

    // Поиск по блогу
    if (type === "all" || type === "blogs") {
      const blogsResult = await getStrapiRecords("blogs", {
        "publicationState": "live",
        "populate": "*",
        "populate[blog_sections]": "*",
        "populate[preview]": "*",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "filters[$or][0][name][$contains]": query,
        "filters[$or][1][description][$contains]": query,
        "filters[$or][2][article][$contains]": query,
        "sort": "publish_date:desc",
      });
      results.blogs = blogsResult;
    }

    return NextResponse.json({ data: results, query }, { status: 200 });
  } catch (error) {
    console.error("Ошибка поиска:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

