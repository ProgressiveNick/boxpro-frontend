/**
 * Единая точка входа для всех конфигураций проекта
 * 
 * Импортируйте конфигурации отсюда для единообразия:
 * 
 * ```typescript
 * import { STRAPI_API_CONFIG, TELEGRAM_CONFIG } from "@/shared/config";
 * ```
 * 
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 */

export { SITE_URL } from "./site";

export {
  STRAPI_API_CONFIG,
  STRAPI_CLIENT_CONFIG,
  TELEGRAM_CONFIG,
  API_CONFIG,
} from "./api";

export type {
  StrapiApiConfig,
  StrapiClientConfig,
  TelegramConfig,
} from "./api";
