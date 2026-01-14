/**
 * Утилиты для работы с тестовыми заявками в Strapi
 * Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
 * Все конфигурации берутся из централизованного конфига @/shared/config/api
 */

import {
  createStrapiRecord,
  getStrapiRecords,
  updateStrapiRecord,
} from "@/shared/lib/api/strapi";

// Интерфейс для данных заявки
interface TestRequestData {
  name: string;
  company: string;
  phone: string;
  productDescription: string;
  needEquipmentSelection: boolean;
  status?: string;
  source?: string;
}

// Функция для создания заявки в Strapi
export async function createTestRequest(data: TestRequestData) {
  try {
    const result = await createStrapiRecord("test-requests", {
      ...data,
      status: data.status || "new",
      source: data.source || "website",
    });
    return result;
  } catch (error) {
    console.error("Ошибка создания заявки в Strapi:", error);
    throw error;
  }
}

// Функция для получения всех заявок
export async function getTestRequests() {
  try {
    const result = await getStrapiRecords("test-requests", {
      populate: "*",
    });

    return result;
  } catch (error) {
    console.error("Ошибка получения заявок из Strapi:", error);
    throw error;
  }
}

// Функция для обновления статуса заявки
export async function updateTestRequestStatus(id: number, status: string) {
  try {
    const result = await updateStrapiRecord("test-requests", id, {
      status,
    });

    return result;
  } catch (error) {
    console.error("Ошибка обновления статуса заявки в Strapi:", error);
    throw error;
  }
}
