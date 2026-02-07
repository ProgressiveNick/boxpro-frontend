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
        { status: 400 },
      );
    }

    const results: {
      products?: unknown;
      blogs?: unknown;
    } = {};

    // Поиск по товарам: сначала оборудование (part !== true), затем запчасти (part === true)
    if (type === "all" || type === "products") {
      const pageNum = parseInt(page, 10) || 1;
      const pageSizeNum = parseInt(pageSize, 10) || 24;
      const offset = (pageNum - 1) * pageSizeNum;

      const searchFilters = {
        "filters[$or][0][name][$contains]": query,
        "filters[$or][1][description][$contains]": query,
        "filters[$or][2][slug][$contains]": query,
      };

      const baseParams = {
        publicationState: "live",
        populate: "*",
        ...searchFilters,
      };

      // Получаем оборудование и запчасти параллельно для подсчёта total
      const [equipmentCountRes, partsCountRes] = await Promise.all([
        getStrapiRecords("tovaries", {
          ...baseParams,
          "filters[part][$ne]": "true",
          "pagination[start]": "0",
          "pagination[limit]": "1",
        }),
        getStrapiRecords("tovaries", {
          ...baseParams,
          "filters[part][$eq]": "true",
          "pagination[start]": "0",
          "pagination[limit]": "1",
        }),
      ]);

      const equipmentTotal = equipmentCountRes?.meta?.pagination?.total ?? 0;
      const partsTotal = partsCountRes?.meta?.pagination?.total ?? 0;
      const total = equipmentTotal + partsTotal;

      let productsData: unknown[] = [];

      if (offset < equipmentTotal) {
        // Берём из оборудования
        const equipmentLimit = Math.min(pageSizeNum, equipmentTotal - offset);
        const equipmentRes = await getStrapiRecords("tovaries", {
          ...baseParams,
          "filters[part][$ne]": "true",
          "pagination[start]": String(offset),
          "pagination[limit]": String(equipmentLimit),
          sort: "name:asc",
        });
        productsData = (equipmentRes?.data ?? []) as unknown[];

        // Если не хватает до pageSize — добираем из запчастей
        if (equipmentLimit < pageSizeNum) {
          const partsLimit = pageSizeNum - equipmentLimit;
          const partsRes = await getStrapiRecords("tovaries", {
            ...baseParams,
            "filters[part][$eq]": "true",
            "pagination[start]": "0",
            "pagination[limit]": String(partsLimit),
            sort: "name:asc",
          });
          productsData = [
            ...productsData,
            ...((partsRes?.data ?? []) as unknown[]),
          ];
        }
      } else {
        // Берём только из запчастей
        const partsStart = offset - equipmentTotal;
        const partsRes = await getStrapiRecords("tovaries", {
          ...baseParams,
          "filters[part][$eq]": "true",
          "pagination[start]": String(partsStart),
          "pagination[limit]": String(pageSizeNum),
          sort: "name:asc",
        });
        productsData = (partsRes?.data ?? []) as unknown[];
      }

      const pageCount = Math.ceil(total / pageSizeNum);

      results.products = {
        data: productsData,
        meta: {
          pagination: {
            total,
            page: pageNum,
            pageSize: pageSizeNum,
            pageCount,
          },
        },
      };
    }

    // Поиск по блогу
    if (type === "all" || type === "blogs") {
      const blogsResult = await getStrapiRecords("blogs", {
        publicationState: "live",
        populate: "*",
        "populate[blog_sections]": "*",
        "populate[preview]": "*",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "filters[$or][0][name][$contains]": query,
        "filters[$or][1][description][$contains]": query,
        "filters[$or][2][article][$contains]": query,
        sort: "publish_date:desc",
      });
      results.blogs = blogsResult;
    }

    return NextResponse.json({ data: results, query }, { status: 200 });
  } catch (error) {
    console.error("Ошибка поиска:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
