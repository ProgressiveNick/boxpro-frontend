/**
 * Конфигурация для валидации переменных окружения
 * Определяет обязательные переменные для разных стендов
 */

export type Environment = "development" | "production";

export interface EnvValidationConfig {
  server: string[];
  /** NEXT_PUBLIC_**/
  client: string[];
  optional?: Record<string, string>;
}

export const envValidationConfig: Record<Environment, EnvValidationConfig> = {
  development: {
    server: [
      "STRAPI_API_BASE_URL",
      "STRAPI_API_TOKEN",
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_CHAT_ID",
    ],
    client: ["NEXT_PUBLIC_STRAPI_API_URL"],
    optional: {
      NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337",
    },
  },
  production: {
    server: [
      "STRAPI_API_BASE_URL",
      "STRAPI_API_TOKEN",
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_CHAT_ID",
    ],
    client: [
      "NEXT_PUBLIC_STRAPI_API_URL",
      "NEXT_PUBLIC_STRAPI_URL",
    ],
  },
};
