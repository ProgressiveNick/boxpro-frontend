/**
 * POST /api/revalidation — webhook-эндпоинт для on-demand инвалидации кэша товаров.
 *
 * Защита: если задана переменная REVALIDATION_SECRET, запрос должен содержать заголовок
 * Authorization: Bearer <REVALIDATION_SECRET>.
 *
 * Инвалидирует:
 * - ISR-кэш обоих feed-роутов (/api/feed/yml, /api/feed/google/merchant)
 * - ISR-кэш страниц каталога и товаров
 * - ISR-кэш главной страницы (popular-products)
 * - Кастомный файловый кэш (.next/cache/catalog/)
 */

import { revalidatePath } from "next/cache";
import { clearServerCache } from "@/shared/lib/server-cache";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  const authHeader = req.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/api/feed/yml");
  revalidatePath("/api/feed/google/merchant");
  revalidatePath("/catalog", "layout");
  revalidatePath("/product", "layout");
  revalidatePath("/", "page");

  await clearServerCache();

  return Response.json({ revalidated: true, timestamp: Date.now() });
}
