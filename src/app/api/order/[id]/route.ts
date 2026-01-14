import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessageWithFiles,
} from "@/shared/lib/api/telegram";
import { getStrapiRecords, updateStrapiRecord } from "@/shared/lib/api/strapi";

interface OrderItem {
  name: string;
  documentId: string;
  count: number;
  sum: number;
}

interface FormFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

interface UpdateOrderData {
  fullName: string;
  phone: string;
  paymentMethod?: string;
  files: FormFile[];
}

// Функция для отправки сообщения в Telegram
async function sendOrderUpdateTelegramMessage(
  orderId: string,
  orderData: UpdateOrderData,
  orderItems: OrderItem[]
) {
  const orderItemsText = orderItems
    .map(
      (item: OrderItem) =>
        `• ${item.name} (${item.documentId}) - ${item.count} шт. - ${item.sum} ₽`
    )
    .join("\n");

  const totalSum = orderItems.reduce(
    (sum: number, item: OrderItem) => sum + item.sum,
    0
  );

  const message = `
🛒 *Заказ оформлен* (ID: ${orderId})

👤 *Клиент:* ${orderData.fullName}
📞 *Телефон:* ${orderData.phone}
${
    orderData.paymentMethod
      ? `💳 *Способ оплаты:* ${getPaymentMethodText(orderData.paymentMethod)}`
      : "💳 *Способ оплаты:* Не указан"
  }

📋 *Товары:*
${orderItemsText}

💰 *Общая сумма:* ${totalSum} ₽

📅 *Дата заказа:* ${new Date().toLocaleString("ru-RU")}
  `;

  console.log("Попытка отправки заказа в Telegram...");

  // Подготавливаем файлы для отправки
  const files =
    orderData.files && orderData.files.length > 0
      ? orderData.files.map((file) => ({
          buffer: file.buffer,
          name: file.name,
          type: file.type,
        }))
      : undefined;

  const success = await sendTelegramMessageWithFiles(
    message,
    files,
    { parse_mode: "Markdown" }
  );

  if (success) {
    console.log("Заказ успешно отправлен в Telegram");
  }

  return success;
}

function getPaymentMethodText(method?: string): string {
  if (!method) return "Не указан";
  switch (method) {
    case "CASH":
      return "Наличные";
    case "CARD":
      return "Банковская карта";
    case "BANK_TRANSFER":
      return "Банковский перевод";
    case "REQUISITE":
      return "С расчетного счета компании";
    case "CREDIT":
      return "Кредит";
    case "LIZING":
      return "Лизинг";
    default:
      return method;
  }
}

// Функция для обновления заказа в Strapi
async function updateOrderInStrapi(
  orderId: string,
  orderData: UpdateOrderData
) {
  try {
    const { updateStrapiRecord } = await import("@/shared/lib/api/strapi");

    console.log("Обновление заказа в Strapi:", {
      orderId,
      orderData: {
        fullName: orderData.fullName,
        phone: orderData.phone,
        hasPaymentMethod: !!orderData.paymentMethod,
        filesCount: orderData.files?.length || 0,
      },
    });

    const result = await updateStrapiRecord("zakazies", orderId, {
      statuses: "В обработке",
      contact: {
        name: orderData.fullName,
        phone: orderData.phone,
        comment: orderData.paymentMethod
          ? `Способ оплаты: ${getPaymentMethodText(orderData.paymentMethod)}`
          : "",
      },
    });

    console.log("Заказ успешно обновлен в Strapi:", result);
    return result;
  } catch (error) {
    console.error("Ошибка обновления заказа в Strapi:", error);
    throw error;
  }
}

// GET - получить заказ по documentId
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const documentId = params.id;

    // Ищем заказ по documentId используя getStrapiRecords
    // Загружаем только нужные поля товара (name, documentId, price), без harakteristici
    // В Strapi v5 используем fields для ограничения загружаемых полей
    let result;
    try {
      result = await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": documentId,
        "populate[tovary][populate][tovar][fields][0]": "name",
        "populate[tovary][populate][tovar][fields][1]": "documentId",
        "populate[tovary][populate][tovar][fields][2]": "price",
        "populate[contact]": "*",
        publicationState: "live",
      });
    } catch (error) {
      console.error("Ошибка поиска заказа (live):", error);
      // Пробуем без publicationState (для черновиков)
      try {
        result = await getStrapiRecords("zakazies", {
          "filters[documentId][$eq]": documentId,
          "populate[tovary][populate][tovar][fields][0]": "name",
          "populate[tovary][populate][tovar][fields][1]": "documentId",
          "populate[tovary][populate][tovar][fields][2]": "price",
          "populate[contact]": "*",
        });
      } catch (draftError) {
        console.error("Ошибка поиска заказа (draft):", draftError);
        // Пробуем без fields - просто не загружаем harakteristici
        try {
          result = await getStrapiRecords("zakazies", {
            "filters[documentId][$eq]": documentId,
            "populate[tovary][populate][tovar]": "name,documentId,price",
            "populate[contact]": "*",
          });
        } catch (finalError) {
          console.error("Ошибка поиска заказа (final):", finalError);
          return NextResponse.json(
            { error: "Заказ не найден" },
            { status: 404 }
          );
        }
      }
    }

    console.log("Результат поиска заказа:", {
      documentId,
      found: result.data?.length || 0,
      firstItem: result.data?.[0]
        ? {
            id: result.data[0].id,
            documentId: result.data[0].documentId,
            statuses: result.data[0].statuses,
          }
        : null,
    });

    if (!result.data || result.data.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    return NextResponse.json({ data: result.data[0] }, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения заказа:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// PUT - обновить заказ (оформить)
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const documentId = params.id;

    console.log("Получен запрос на оформление заказа:", documentId);

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    // Получаем текущий заказ для товаров по documentId
    // Загружаем только нужные поля товара (name, documentId, price), без harakteristici
    let orderResult;
    try {
      orderResult = await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": documentId,
        "populate[tovary][populate][tovar][fields][0]": "name",
        "populate[tovary][populate][tovar][fields][1]": "documentId",
        "populate[tovary][populate][tovar][fields][2]": "price",
        publicationState: "live",
      });
    } catch (error) {
      console.error("Ошибка получения заказа (live):", error);
      // Пробуем без publicationState (для черновиков)
      try {
        orderResult = await getStrapiRecords("zakazies", {
          "filters[documentId][$eq]": documentId,
          "populate[tovary][populate][tovar][fields][0]": "name",
          "populate[tovary][populate][tovar][fields][1]": "documentId",
          "populate[tovary][populate][tovar][fields][2]": "price",
        });
      } catch (draftError) {
        console.error("Ошибка получения заказа (draft):", draftError);
        return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
      }
    }

    if (!orderResult.data || orderResult.data.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    const order = orderResult.data[0];

    // Проверяем, что у заказа есть documentId
    if (!order.documentId) {
      console.error("Заказ не имеет documentId:", order);
      return NextResponse.json(
        { error: "Заказ не найден (отсутствует documentId)" },
        { status: 404 }
      );
    }

    // Используем documentId для обновления заказа в Strapi
    const orderDocumentId = order.documentId;

    console.log("Обновление заказа:", {
      documentId: orderDocumentId,
      numericId: order.id,
      orderStatus: order.statuses,
    });

    // Преобразуем товары заказа в формат OrderItem
    const orderItems: OrderItem[] = (order.tovary || []).map(
      (item: {
        tovar?: {
          name?: string;
          documentId?: string;
          price?: number;
        };
        count?: number;
      }) => ({
        name: item.tovar?.name || "Товар",
        documentId: item.tovar?.documentId || "",
        count: item.count || 0,
        sum: (item.tovar?.price || 0) * (item.count || 0),
      })
    );

    const formData = await request.formData();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const files = formData.getAll("files") as File[];

    // Валидация данных
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Обработка файлов
    const processedFiles: FormFile[] = [];
    if (files.length > 0) {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          buffer,
        });
      }
    }

    const updateData: UpdateOrderData = {
      fullName,
      phone,
      paymentMethod: paymentMethod || undefined,
      files: processedFiles,
    };

    // Обновление заказа в Strapi используя documentId
    const strapiResult = await updateOrderInStrapi(orderDocumentId, updateData);

    // Отправка в Telegram
    const telegramSuccess = await sendOrderUpdateTelegramMessage(
      order.documentId || String(order.id),
      updateData,
      orderItems
    );

    if (!telegramSuccess) {
      console.error("Ошибка отправки в Telegram");
      // Не возвращаем ошибку, так как заказ уже сохранен в Strapi
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заказ успешно оформлен",
        orderId: strapiResult?.data?.id,
        documentId: strapiResult?.data?.documentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка обработки заказа:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}




