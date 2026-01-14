/**
 * Утилиты для работы со Strapi API
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 * Все конфигурации берутся из централизованного конфига @/shared/config/api
 */

import { STRAPI_API_CONFIG } from "@/shared/config/api";

const STRAPI_API_URL = STRAPI_API_CONFIG.baseURL;
const STRAPI_TOKEN = STRAPI_API_CONFIG.token;

// Базовая функция для запросов к Strapi
export async function fetchStrapi(endpoint: string, options: RequestInit = {}) {
  const url = `${STRAPI_API_URL}${endpoint}`;

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Strapi API Error:`, {
      status: response.status,
      statusText: response.statusText,
      url,
      errorText,
    });
    throw new Error(
      `Strapi API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return response.json();
}

// Функция для создания записи в Strapi
// STRAPI_API_URL уже содержит /api, поэтому используем /${collection}
export async function createStrapiRecord(collection: string, data: unknown) {
  return fetchStrapi(`/${collection}`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

// Функция для обновления записи в Strapi
// STRAPI_API_URL уже содержит /api, поэтому используем /${collection}/${id}
export async function updateStrapiRecord(
  collection: string,
  id: string | number,
  data: unknown
) {
  return fetchStrapi(`/${collection}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

// Функция для получения записей из Strapi
export async function getStrapiRecords(
  collection: string,
  params: Record<string, string | number | string[]> = {}
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v, index) => {
        searchParams.append(`${key}[${index}]`, String(v));
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/${collection}?${queryString}`
    : `/${collection}`;

  return fetchStrapi(endpoint);
}

// Функция для получения одной записи из Strapi
export async function getStrapiRecord(
  collection: string,
  id: string | number,
  populate = "*"
) {
  return fetchStrapi(`/${collection}/${id}?populate=${populate}`);
}

/**
 * Загружает файлы в Strapi
 * @param files - FormData с файлами или массив File объектов
 * @returns Массив ID загруженных файлов
 */
export async function uploadStrapiFiles(
  files: FormData | File[]
): Promise<number[]> {
  const formData = files instanceof FormData ? files : new FormData();
  
  if (!(files instanceof FormData)) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await fetch(`${STRAPI_API_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Strapi upload error:", {
      status: response.status,
      statusText: response.statusText,
      errorText,
    });
    throw new Error(
      `Strapi upload error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const result = await response.json();
  return result.map((file: { id: number }) => file.id);
}
