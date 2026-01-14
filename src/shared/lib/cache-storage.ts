/**
 * Утилиты для работы с localStorage кэшем
 */

const CACHE_PREFIX = "boxpro_cache_";
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

type CacheItem<T> = {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
};

/**
 * Получить данные из кэша
 */
export function getCacheItem<T>(
  key: string,
  version?: string
): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const item = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!item) {
      return null;
    }

    const cached: CacheItem<T> = JSON.parse(item);

    // Проверяем версию
    if (version && cached.version !== version) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    // Проверяем TTL
    const now = Date.now();
    const age = now - cached.timestamp;
    if (age > cached.ttl) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return cached.data;
  } catch (error) {
    console.error(`Error reading cache for key "${key}":`, error);
    return null;
  }
}

/**
 * Сохранить данные в кэш
 */
export function setCacheItem<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL,
  version?: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version,
    };

    // Проверяем размер данных перед сохранением
    const serialized = JSON.stringify(cacheItem);
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024);

    // Если данные больше 5MB, не сохраняем в localStorage
    if (sizeInMB > 5) {
      console.warn(
        `Cache item "${key}" is too large (${sizeInMB.toFixed(2)}MB), skipping cache`
      );
      return;
    }

    localStorage.setItem(`${CACHE_PREFIX}${key}`, serialized);
  } catch (error) {
    // Если localStorage переполнен, пытаемся очистить старые записи
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded, cleaning old cache items");
      clearOldCache();
      // Пытаемся сохранить еще раз
      try {
        const cacheItem: CacheItem<T> = {
          data,
          timestamp: Date.now(),
          ttl,
          version,
        };
        localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
      } catch (retryError) {
        console.error(`Error saving cache for key "${key}" after cleanup:`, retryError);
      }
    } else {
      console.error(`Error saving cache for key "${key}":`, error);
    }
  }
}

/**
 * Удалить элемент из кэша
 */
export function removeCacheItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}

/**
 * Очистить все устаревшие элементы кэша
 */
export function clearOldCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const cached: CacheItem<unknown> = JSON.parse(item);
          const age = now - cached.timestamp;
          if (age > cached.ttl) {
            keysToRemove.push(key);
          }
        }
      } catch {
        // Если не удалось распарсить, удаляем
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Очистить весь кэш
 */
export function clearCache(): void {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}


