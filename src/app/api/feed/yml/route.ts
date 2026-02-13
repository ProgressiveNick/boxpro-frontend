/**
 * GET /api/feed/yml — товарный фид в формате YML для Яндекс Товаров.
 * @see https://yandex.ru/support/merchants/ru/connect/form-feed.html
 */

import { NextResponse } from "next/server";
import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { getProductsForFeed } from "@/entities/product/api/server";
import { buildYmlFeed } from "@/shared/lib/yml-feed";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [categories, products] = await Promise.all([
      getCatalogMenu(),
      getProductsForFeed(),
    ]);

    const xml = buildYmlFeed({ categories, products });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("[feed/yml] Error generating feed:", error);
    return NextResponse.json(
      { error: "Failed to generate feed" },
      { status: 500 }
    );
  }
}
