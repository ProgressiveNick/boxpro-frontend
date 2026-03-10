/**
 * Получение списка городов из локального JSON. Для использования из Server Actions.
 */

import { readFile } from "fs/promises";
import path from "path";

export type City = { id: number; title: string };

const DEFAULT_COUNT = 25;
const MAX_COUNT = 100;

let cachedCities: City[] | null = null;

export async function getCitiesLogic(
  options: { q?: string; offset?: number; count?: number } = {}
): Promise<{
  data: City[];
  meta: {
    count: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}> {
  if (!cachedCities) {
    const filePath = path.join(process.cwd(), "src/data/cities.json");
    const content = await readFile(filePath, "utf-8");
    cachedCities = JSON.parse(content);
  }

  const offset = Math.max(
    0,
    parseInt(String(options.offset ?? 0), 10)
  );
  const count = Math.min(
    MAX_COUNT,
    Math.max(1, parseInt(String(options.count ?? DEFAULT_COUNT), 10))
  );

  const list = cachedCities;
  if (!list) {
    return {
      data: [],
      meta: { count: 0, offset, total: 0, hasMore: false },
    };
  }

  const q = options.q?.trim().toLowerCase();
  const filtered = q
    ? list.filter((city) => city.title.toLowerCase().includes(q))
    : list;

  filtered.sort((a, b) => a.title.localeCompare(b.title, "ru"));

  const total = filtered.length;
  const page = filtered.slice(offset, offset + count);

  return {
    data: page,
    meta: {
      count: page.length,
      offset,
      total,
      hasMore: offset + page.length < total,
    },
  };
}
