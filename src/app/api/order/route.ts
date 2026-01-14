import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
  sendTelegramMessageWithFiles,
} from "@/shared/lib/api/telegram";
import { createStrapiRecord } from "@/shared/lib/api/strapi";

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

interface OrderData {
  fullName: string;
  phone: string;
  paymentMethod?: string;
  order: OrderItem[];
  files: FormFile[];
}

// Функция для отправки сообщения в Telegram
async function sendOrderTelegramMessage(orderData: OrderData) {
  const orderItems = orderData.order
    .map(
      (item: OrderItem) =>
        `• ${item.name} (${item.documentId}) - ${item.count} шт. - ${item.sum} ₽`
    )
    .join("\n");

  const totalSum = orderData.order.reduce(
    (sum: number, item: OrderItem) => sum + item.sum,
    0
  );

  const message = `
🛒 *Новый заказ*

👤 *Клиент:* ${orderData.fullName}
📞 *Телефон:* ${orderData.phone}
${
  orderData.paymentMethod
    ? `💳 *Способ оплаты:* ${getPaymentMethodText(orderData.paymentMethod)}`
    : "💳 *Способ оплаты:* Не указан"
}

📋 *Товары:*
${orderItems}

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

  const success = await sendTelegramMessageWithFiles(message, files, {
    parse_mode: "Markdown",
  });

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

// Функция для сохранения в Strapi
async function saveToStrapi(orderData: OrderData) {
  try {
    const totalSum = orderData.order.reduce(
      (sum: number, item: OrderItem) => sum + item.sum,
      0
    );

    const tovary = orderData.order.map((item: OrderItem) => ({
      tovar: item.documentId,
      count: item.count,
    }));

    const result = await createStrapiRecord("zakazies", {
      name: orderData.fullName,
      phone: orderData.phone,
      paymentMethod: orderData.paymentMethod || null,
      sum: totalSum,
      tovary: tovary,
      sostoyanie: "new",
    });

    return result;
  } catch (error) {
    console.error("Ошибка сохранения в Strapi:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Получен запрос на /api/order");

    // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init

    const formData = await request.formData();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const orderJson = formData.get("order") as string;
    const files = formData.getAll("files") as File[];

    // Парсим JSON с товарами
    let order: OrderItem[];
    try {
      order = JSON.parse(orderJson);
    } catch {
      return NextResponse.json(
        { error: "Неверный формат данных заказа" },
        { status: 400 }
      );
    }

    // Валидация данных
    if (!fullName || !phone || !order || order.length === 0) {
      return NextResponse.json(
        { error: "Не все обязательные поля заполнены или корзина пуста" },
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

    const orderData: OrderData = {
      fullName,
      phone,
      paymentMethod: paymentMethod || undefined,
      order,
      files: processedFiles,
    };

    // Отправка в Telegram
    const telegramSuccess = await sendOrderTelegramMessage(orderData);

    // Сохранение в Strapi
    const strapiResult = await saveToStrapi(orderData);

    // Проверяем успешность операций
    if (!telegramSuccess) {
      console.error("Ошибка отправки в Telegram");
      return NextResponse.json(
        { error: "Ошибка отправки уведомления в Telegram" },
        { status: 500 }
      );
    }

    if (!strapiResult) {
      console.error("Ошибка сохранения в Strapi");
      return NextResponse.json(
        { error: "Ошибка сохранения данных" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Заказ успешно оформлен",
        orderId: strapiResult?.data?.id,
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
