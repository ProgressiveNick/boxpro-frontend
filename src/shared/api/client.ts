import { strapi } from "@strapi/client";
import { STRAPI_CLIENT_CONFIG } from "@/shared/config/api";

// Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
const STRAPI_API_URL = STRAPI_CLIENT_CONFIG.baseURL;

export const strapiClient = strapi({
  baseURL: STRAPI_API_URL,
});

export const productsClientService = strapiClient.collection("products");
