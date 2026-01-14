/**
 * @deprecated Этот файл устарел. Используйте @/shared/lib/helpers/imageUrl
 * 
 * Реэкспорт для обратной совместимости.
 * Все новые импорты должны использовать:
 * ```typescript
 * import { getImageUrl } from "@/shared/lib/helpers/imageUrl";
 * // Использование: getImageUrl(path, "strapi")
 * ```
 * 
 * ВАЖНО: В новой утилите функция getImageUrl требует указания source параметра.
 * Для Strapi изображений используйте: getImageUrl(path, "strapi")
 */

import { getImageUrl as getImageUrlNew } from "./imageUrl";

/**
 * @deprecated Используйте getImageUrl(path, "strapi") из @/shared/lib/helpers/imageUrl
 * 
 * Обертка для обратной совместимости - автоматически использует source="strapi"
 * Сохраняет старую сигнатуру функции для совместимости со старым кодом
 */
export function getImageUrl(path: string | undefined | null): string {
  return getImageUrlNew(path, "strapi");
}

/**
 * Реэкспорт новой функции для тех, кто хочет использовать новый API
 */
export { getStrapiImageUrl } from "./imageUrl";
