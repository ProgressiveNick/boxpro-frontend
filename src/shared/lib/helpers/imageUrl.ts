/**
 * Универсальная утилита для формирования URL изображений
 * Объединяет логику для локальных изображений и изображений из Strapi
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 */

import { STRAPI_CLIENT_CONFIG } from "@/shared/config/api";

export type ImageSource = "local" | "strapi";

/**
 * Формирует правильный URL для изображения в зависимости от источника
 * @param path - путь к изображению
 * @param source - источник изображения: "local" для локальных файлов, "strapi" для изображений из Strapi
 * @param fallback - путь к изображению по умолчанию (используется только для local)
 * @returns Полный URL изображения
 */
export function getImageUrl(
  path: string | undefined | null,
  source: ImageSource = "local",
  fallback: string = "/img/products/empty.jpg"
): string {
  if (!path) {
    return source === "local" ? fallback : "";
  }

  const trimmedPath = path.trim();

  // Если путь уже полный URL, возвращаем как есть
  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    return trimmedPath;
  }

  // Для локальных изображений
  if (source === "local") {
    // Если путь начинается со слэша, возвращаем как есть
    if (trimmedPath.startsWith("/")) {
      return trimmedPath;
    }
    // Если путь не начинается со слэша, добавляем его
    return `/${trimmedPath}`;
  }

  // Для изображений из Strapi
  if (source === "strapi") {
    // Используем базовый URL Strapi из конфигурации
    return `${STRAPI_CLIENT_CONFIG.imageURL}${trimmedPath}`;
  }

  return trimmedPath;
}

/**
 * Формирует URL для локальных изображений товаров
 * Изображения хранятся в public/storage/ и обслуживаются Next.js как статические файлы
 * @param path - путь к изображению
 * @returns Полный URL изображения или путь к изображению по умолчанию
 * 
 * @deprecated Используйте getImageUrl(path, "local") для большей гибкости
 */
export function getProductImageUrl(path: string | undefined | null): string {
  return getImageUrl(path, "local", "/img/products/empty.jpg");
}

/**
 * Формирует полный URL для изображений из Strapi
 * @param path - путь к изображению из Strapi
 * @returns Полный URL изображения или пустую строку, если путь пустой
 * 
 * @deprecated Используйте getImageUrl(path, "strapi") для большей гибкости
 */
export function getStrapiImageUrl(path: string | undefined | null): string {
  return getImageUrl(path, "strapi");
}
