/**
 * GET /api/feed/yml — товарный фид в формате YML для Яндекс Товаров.
 * @see https://yandex.ru/support/merchants/ru/connect/form-feed.html
 *
 * Генерируется только в runtime (без пререндера на этапе билда) и по запросу
 * с ревалидацией раз в 6 часов (не на каждый запрос).
 * Опциональная защита: если задана переменная FEED_SECRET_KEY, запрос должен
 * содержать query-параметр key с тем же значением (например: /api/feed/yml?key=...).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCatalogMenu } from "@/entities/categories/api/getCatalogMenu";
import { getProductsForFeed } from "@/entities/product/api/server";
import { buildYmlFeed } from "@/shared/lib/yml-feed";

/** Отключаем пререндер на build: фид генерируется только в runtime */
export const dynamic = "force-dynamic";
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
    const [categories, products] = await Promise.all([
      getCatalogMenu(),
      getProductsForFeed(),
    ]);

    const xml = buildYmlFeed({ categories, products });

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=21600",
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
