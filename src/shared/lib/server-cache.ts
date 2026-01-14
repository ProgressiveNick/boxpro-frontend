"use server";

import { promises as fs } from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".next/cache/catalog");

type CacheItem<T> = {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
};

const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах

// In-memory кэш для быстрого доступа
const memoryCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

/**
 * Инициализировать директорию кэша
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    // Игнорируем ошибки создания директории
    console.warn("Failed to create cache directory:", error);
  }
}

/**
 * Получить данные из файлового кэша
 * Использует двухуровневое кэширование: память + файл
 */
export async function getServerCache<T>(
  cacheKey: string,
  version?: string
): Promise<T | null> {
  // Проверяем in-memory кэш сначала
  const memoryKey = `${cacheKey}_${version || ""}`;
  const memoryCached = memoryCache.get(memoryKey);
  if (memoryCached) {
    const now = Date.now();
    const age = now - memoryCached.timestamp;
    if (age <= memoryCached.ttl) {
      return memoryCached.data as T;
    }
    // Удаляем устаревший из памяти
    memoryCache.delete(memoryKey);
  }

  try {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    const fileContent = await fs.readFile(filePath, "utf-8");
    const cached: CacheItem<T> = JSON.parse(fileContent);

    // Проверяем версию
    if (version && cached.version !== version) {
      await fs.unlink(filePath).catch(() => {});
      return null;
    }

    // Проверяем TTL
    const now = Date.now();
    const age = now - cached.timestamp;
    if (age > cached.ttl) {
      await fs.unlink(filePath).catch(() => {});
      return null;
    }

    // Сохраняем в память для быстрого доступа
    memoryCache.set(memoryKey, {
      data: cached.data,
      timestamp: cached.timestamp,
      ttl: cached.ttl,
    });

    return cached.data;
  } catch {
    // Если файл не существует или произошла ошибка - возвращаем null
    return null;
  }
}

/**
 * Сохранить данные в файловый кэш
 * Сохраняет как в файл, так и в память
 */
export async function setServerCache<T>(
  cacheKey: string,
  data: T,
  ttl: number = DEFAULT_TTL,
  version?: string
): Promise<void> {
  const timestamp = Date.now();
  const memoryKey = `${cacheKey}_${version || ""}`;

  // Сохраняем в память сразу
  memoryCache.set(memoryKey, {
    data,
    timestamp,
    ttl,
  });

  // Сохраняем в файл асинхронно (не блокируем)
  try {
    await ensureCacheDir();
    const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      ttl,
      version,
    };

    const serialized = JSON.stringify(cacheItem);
    await fs.writeFile(filePath, serialized, "utf-8");
  } catch (error) {
    console.warn(`Failed to save cache for key "${cacheKey}":`, error);
  }
}

/**
 * Удалить элемент из кэша
 */
export async function removeServerCache(cacheKey: string): Promise<void> {
  try {
    const filePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    await fs.unlink(filePath).catch(() => {});
  } catch {
    // Игнорируем ошибки удаления
  }
}

/**
 * Очистить весь кэш каталога
 */
export async function clearServerCache(): Promise<void> {
  try {
    const files = await fs.readdir(CACHE_DIR);
    await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map((file) => fs.unlink(path.join(CACHE_DIR, file)).catch(() => {}))
    );
  } catch {
    // Игнорируем ошибки очистки
  }
}
