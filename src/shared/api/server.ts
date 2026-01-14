import { strapi } from "@strapi/client";
import { STRAPI_API_CONFIG } from "@/shared/config/api";

// Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
const STRAPI_API_URL = STRAPI_API_CONFIG.baseURL;

// Ленивая инициализация для поддержки переменных окружения из .env.local
let strapiServerInstance: ReturnType<typeof strapi> | null = null;

function getStrapiServer() {
  if (!strapiServerInstance) {
    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
    const STRAPI_TOKEN = STRAPI_API_CONFIG.token;

    strapiServerInstance = strapi({
      baseURL: STRAPI_API_URL,
      auth: STRAPI_TOKEN,
    });
  }

  return strapiServerInstance;
}

// Экспортируем strapiServer как геттер для ленивой инициализации
export const strapiServer = {
  collection: (name: string) => getStrapiServer().collection(name),
} as ReturnType<typeof strapi>;

// Ленивая инициализация сервисов через геттеры
let categoriesServiceInstance: ReturnType<
  typeof strapiServer.collection
> | null = null;
let productsServerServiceInstance: ReturnType<
  typeof strapiServer.collection
> | null = null;
let attributesServerServiceInstance: ReturnType<
  typeof strapiServer.collection
> | null = null;
let attributesValuesServerServiceInstance: ReturnType<
  typeof strapiServer.collection
> | null = null;

function createLazyService(
  getter: () => ReturnType<typeof strapiServer.collection>
) {
  return new Proxy({} as ReturnType<typeof strapiServer.collection>, {
    get(_target, prop) {
      const service = getter();
      const value = service[prop as keyof typeof service];
      if (typeof value === "function") {
        return value.bind(service);
      }
      return value;
    },
  });
}

export const categoriesService = createLazyService(() => {
  if (!categoriesServiceInstance) {
    categoriesServiceInstance =
      getStrapiServer().collection("kategorii-tovarovs");
  }
  return categoriesServiceInstance;
});

export const productsServerService = createLazyService(() => {
  if (!productsServerServiceInstance) {
    productsServerServiceInstance = getStrapiServer().collection("tovaries");
  }
  return productsServerServiceInstance;
});

export const attributesServerService = createLazyService(() => {
  if (!attributesServerServiceInstance) {
    attributesServerServiceInstance = getStrapiServer().collection(
      "harakteristiki-tovarovs"
    );
  }
  return attributesServerServiceInstance;
});

export const attributesValuesServerService = createLazyService(() => {
  if (!attributesValuesServerServiceInstance) {
    attributesValuesServerServiceInstance = getStrapiServer().collection(
      "znacheniya-harakteristiks"
    );
  }
  return attributesValuesServerServiceInstance;
});
