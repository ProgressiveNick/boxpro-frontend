/**
 * Хелперы для формирования абсолютных URL (JSON-LD, микроразметка, canonical).
 */

import { SITE_URL } from "@/shared/config/site";

const DEFAULT_IMAGE_FALLBACK = "/img/products/empty.jpg";

/**
 * Преобразует относительный путь в абсолютный URL.
 * Если path уже начинается с http(s)://, возвращает как есть.
 */
export function getAbsoluteUrl(path: string | undefined | null): string {
  if (!path || !path.trim()) {
    return SITE_URL;
  }
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Возвращает абсолютный URL изображения для разметки (JSON-LD и т.д.).
 * Если path пустой, подставляет fallback (по умолчанию /img/products/empty.jpg).
 */
export function getAbsoluteImageUrl(
  path: string | undefined | null,
  fallback: string = DEFAULT_IMAGE_FALLBACK
): string {
  const resolved = path?.trim() || fallback;
  return getAbsoluteUrl(resolved);
}
