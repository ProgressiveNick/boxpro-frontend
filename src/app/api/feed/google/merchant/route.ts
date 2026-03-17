/**
 * GET /api/feed/google/merchant — товарный фид для Google Merchant Center (XML / RSS 2.0).
 *
 * Генерируется по запросу с ревалидацией раз в 6 часов (не на каждый запрос).
 * Опциональная защита: если задана переменная FEED_SECRET_KEY, запрос должен
 * содержать query-параметр key с тем же значением (например: /api/feed/google/merchant?key=...).
 *
 * Документация:
 * - Product data specification: https://support.google.com/merchants/answer/12374301
 * - Create a product file: https://support.google.com/merchants/answer/160567
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductsForFeed } from "@/entities/product/api/server";
import { buildGoogleMerchantFeed } from "@/shared/lib/google-merchant-feed";

/** Ревалидация фида раз в 6 часов (значение должно быть статически анализируемым) */
export const revalidate = 21600;

export async function GET(request: NextRequest) {
  const feedSecretKey = process.env.FEED_SECRET_KEY;
  if (feedSecretKey) {
    const key = request.nextUrl.searchParams.get("key");
    if (key !== feedSecretKey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const products = await getProductsForFeed();
    const xml = buildGoogleMerchantFeed({ products });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600",
      },
    });
  } catch (error) {
    console.error("[feed/google/merchant] Error generating feed:", error);
    return NextResponse.json(
      { error: "Failed to generate feed" },
      { status: 500 },
    );
  }
}

