import { NextRequest, NextResponse } from "next/server";
import {
  getStrapiRecords,
  createStrapiRecord,
  updateStrapiRecord,
} from "@/shared/lib/api/strapi";

interface OrderItem {
  name: string;
  documentId: string;
  count: number;
  sum: number;
}

interface DraftOrderRequest {
  order: OrderItem[];
}

// Функция для получения ID товара по documentId
async function getProductIdByDocumentId(
  documentId: string
): Promise<number | null> {
  try {
    const result = await getStrapiRecords("tovaries", {
      "filters[documentId][$eq]": documentId,
      publicationState: "live",
    });

    if (result.data && result.data.length > 0) {
      return result.data[0].id;
    }
    return null;
  } catch (error) {
    console.error("Ошибка получения товара:", error);
    return null;
  }
}

// Функция для создания черновика заказа в Strapi
async function createDraftOrder(orderItems: OrderItem[]) {
  try {
    const totalSum = orderItems.reduce(
      (sum: number, item: OrderItem) => sum + item.sum,
      0
    );

    // Получаем ID товаров по их documentId
    const tovary = await Promise.all(
      orderItems.map(async (item: OrderItem) => {
        const productId = await getProductIdByDocumentId(item.documentId);
        if (!productId) {
          throw new Error(`Товар с documentId ${item.documentId} не найден`);
        }
        return {
          tovar: productId, // ID товара для связи
          count: item.count,
        };
      })
    );

    // Создаем заказ
    const result = await createStrapiRecord("zakazies", {
      statuses: "Не оформлен",
      sum: totalSum,
      tovary: tovary,
      publishedAt: new Date().toISOString(), // Публикуем сразу
    });

    console.log("Создан заказ в Strapi:", {
      id: result.data?.id,
      documentId: result.data?.documentId,
      statuses: result.data?.statuses,
    });
    return result;
  } catch (error) {
    console.error("Ошибка создания черновика заказа в Strapi:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Получен запрос на создание черновика заказа");

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    const body: DraftOrderRequest = await request.json();

    // Валидация данных
    if (!body.order || body.order.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }

    // Создание черновика заказа
    const strapiResult = await createDraftOrder(body.order);

    if (!strapiResult || !strapiResult.data) {
      console.error("Ошибка создания черновика заказа");
      return NextResponse.json(
        { error: "Ошибка создания заказа" },
        { status: 500 }
      );
    }

    console.log("Результат создания заказа:", {
      id: strapiResult.data.id,
      documentId: strapiResult.data.documentId,
      fullData: JSON.stringify(strapiResult.data, null, 2),
    });

    if (!strapiResult.data.documentId) {
      console.error("documentId не получен в ответе Strapi");
      // Пробуем получить заказ по id для получения documentId
      try {
        const getResult = await getStrapiRecords("zakazies", {
          "filters[id][$eq]": strapiResult.data.id,
        });
        if (getResult.data && getResult.data.length > 0) {
          strapiResult.data.documentId = getResult.data[0]?.documentId;
          console.log(
            "Получен documentId из отдельного запроса:",
            strapiResult.data.documentId
          );
        }
      } catch (error) {
        console.error("Ошибка получения documentId:", error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        orderId: strapiResult.data.id,
        documentId: strapiResult.data.documentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
