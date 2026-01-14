/**
 * Конфигурация API
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 * Все значения берутся из переменных окружения, хардкод не используется
 * 
 * Это единая точка доступа ко всем env переменным проекта.
 * Все модули должны использовать эти конфиги вместо прямого обращения к process.env
 */

/**
 * Конфигурация для серверного Strapi API
 * Используется для серверных запросов с авторизацией
 */
export const STRAPI_API_CONFIG = {
  baseURL: process.env.STRAPI_API_BASE_URL!,
  token: process.env.STRAPI_API_TOKEN!,
} as const;

/**
 * Конфигурация для клиентского Strapi API
 * Используется для клиентских запросов и формирования URL изображений
 */
export const STRAPI_CLIENT_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL!,
  imageURL: process.env.NEXT_PUBLIC_STRAPI_URL!,
} as const;

/**
 * Конфигурация для Telegram бота
 * Используется для отправки уведомлений
 */
export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
} as const;

/**
 * @deprecated Используйте STRAPI_API_CONFIG, STRAPI_CLIENT_CONFIG или TELEGRAM_CONFIG
 *  для обратной совместимости
 */
export const API_CONFIG = {
  STRAPI_API_URL: STRAPI_API_CONFIG.baseURL,
  STRAPI_PUBLIC_TOKEN: STRAPI_API_CONFIG.token,
} as const;

/**
 * Типы для конфигураций
 */
export type StrapiApiConfig = typeof STRAPI_API_CONFIG;
export type StrapiClientConfig = typeof STRAPI_CLIENT_CONFIG;
export type TelegramConfig = typeof TELEGRAM_CONFIG;
