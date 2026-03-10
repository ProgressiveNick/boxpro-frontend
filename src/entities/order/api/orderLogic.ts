/**
 * Бизнес-логика заказов. Используется из Route Handlers и Server Actions.
 * Не экспортировать на клиент.
 */

import {
  sendTelegramMessage,
  sendTelegramMessageWithFiles,
} from "@/shared/lib/api/telegram";
import {
  getStrapiRecords,
  createStrapiRecord,
  updateStrapiRecord,
  uploadStrapiFiles,
} from "@/shared/lib/api/strapi";

export interface OrderItem {
  name: string;
  documentId: string;
  count: number;
  sum: number;
}

export interface FormFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
}

export interface OrderData {
  fullName: string;
  phone: string;
  paymentMethod?: string;
  order: OrderItem[];
  files: FormFile[];
}

export interface UpdateOrderData {
  fullName: string;
  phone: string;
  paymentMethod?: string;
  files: FormFile[];
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

async function sendOrderTelegramMessage(orderData: OrderData): Promise<boolean> {
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

  const files =
    orderData.files && orderData.files.length > 0
      ? orderData.files.map((file) => ({
          buffer: file.buffer,
          name: file.name,
          type: file.type,
        }))
      : undefined;

  return sendTelegramMessageWithFiles(message, files, {
    parse_mode: "Markdown",
  });
}

async function saveOrderToStrapi(orderData: OrderData) {
  const totalSum = orderData.order.reduce(
    (sum: number, item: OrderItem) => sum + item.sum,
    0
  );

  const tovary = orderData.order.map((item: OrderItem) => ({
    tovar: item.documentId,
    count: item.count,
  }));

  return createStrapiRecord("zakazies", {
    name: orderData.fullName,
    phone: orderData.phone,
    paymentMethod: orderData.paymentMethod || null,
    sum: totalSum,
    tovary: tovary,
    sostoyanie: "new",
  });
}

export async function submitOrderLogic(
  orderData: OrderData
): Promise<{ success: boolean; orderId?: number; error?: string }> {
  const telegramSuccess = await sendOrderTelegramMessage(orderData);
  if (!telegramSuccess) {
    return { success: false, error: "Ошибка отправки уведомления в Telegram" };
  }

  const strapiResult = await saveOrderToStrapi(orderData);
  if (!strapiResult?.data?.id) {
    return { success: false, error: "Ошибка сохранения данных" };
  }

  return {
    success: true,
    orderId: strapiResult.data.id,
  };
}

const ORDER_POPULATE_PARAMS = {
  "populate[tovary][populate][tovar][fields][0]": "name",
  "populate[tovary][populate][tovar][fields][1]": "documentId",
  "populate[tovary][populate][tovar][fields][2]": "price",
  "populate[contact]": "*",
  publicationState: "live",
} as const;

async function getOrderByDocumentId(documentId: string) {
  try {
    return await getStrapiRecords("zakazies", {
      ...ORDER_POPULATE_PARAMS,
      "filters[documentId][$eq]": documentId,
    });
  } catch {
    try {
      return await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": documentId,
        "populate[tovary][populate][tovar][fields][0]": "name",
        "populate[tovary][populate][tovar][fields][1]": "documentId",
        "populate[tovary][populate][tovar][fields][2]": "price",
        "populate[contact]": "*",
      });
    } catch {
      return await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": documentId,
        "populate[tovary][populate][tovar]": "name,documentId,price",
        "populate[contact]": "*",
      });
    }
  }
}

export async function getOrderLogic(
  documentId: string
): Promise<{ data?: unknown; error?: string }> {
  const result = await getOrderByDocumentId(documentId);
  if (!result.data || result.data.length === 0) {
    return { error: "Заказ не найден" };
  }
  return { data: result.data[0] };
}

async function getProductIdByDocumentId(
  documentId: string
): Promise<number | null> {
  const result = await getStrapiRecords("tovaries", {
    "filters[documentId][$eq]": documentId,
    publicationState: "live",
  });
  if (result.data && result.data.length > 0) {
    return result.data[0].id;
  }
  return null;
}

export async function createOrderDraftLogic(
  orderItems: OrderItem[]
): Promise<{
  success: boolean;
  orderId?: number;
  documentId?: string;
  error?: string;
}> {
  const totalSum = orderItems.reduce(
    (sum: number, item: OrderItem) => sum + item.sum,
    0
  );

  const tovary = await Promise.all(
    orderItems.map(async (item: OrderItem) => {
      const productId = await getProductIdByDocumentId(item.documentId);
      if (!productId) {
        throw new Error(`Товар с documentId ${item.documentId} не найден`);
      }
      return { tovar: productId, count: item.count };
    })
  );

  const result = await createStrapiRecord("zakazies", {
    statuses: "Не оформлен",
    sum: totalSum,
    tovary: tovary,
    publishedAt: new Date().toISOString(),
  });

  if (!result?.data) {
    return { success: false, error: "Ошибка создания заказа" };
  }

  let documentId = result.data.documentId;
  if (!documentId) {
    const getResult = await getStrapiRecords("zakazies", {
      "filters[id][$eq]": result.data.id,
    });
    if (getResult.data?.[0]) {
      documentId = getResult.data[0].documentId;
    }
  }

  return {
    success: true,
    orderId: result.data.id,
    documentId: documentId ?? undefined,
  };
}

async function sendOrderUpdateTelegramMessage(
  orderId: string,
  orderData: UpdateOrderData,
  orderItems: OrderItem[]
): Promise<boolean> {
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

  const files =
    orderData.files?.length > 0
      ? orderData.files.map((file) => ({
          buffer: file.buffer,
          name: file.name,
          type: file.type,
        }))
      : undefined;

  return sendTelegramMessageWithFiles(message, files, {
    parse_mode: "Markdown",
  });
}

export async function updateOrderLogic(
  documentId: string,
  orderData: UpdateOrderData,
  orderItems: OrderItem[]
): Promise<{
  success: boolean;
  orderId?: number;
  documentId?: string;
  error?: string;
}> {
  const strapiResult = await updateStrapiRecord("zakazies", documentId, {
    statuses: "В обработке",
    contact: {
      name: orderData.fullName,
      phone: orderData.phone,
      comment: orderData.paymentMethod
        ? `Способ оплаты: ${getPaymentMethodText(orderData.paymentMethod)}`
        : "",
    },
  });

  await sendOrderUpdateTelegramMessage(documentId, orderData, orderItems);

  const data = strapiResult?.data;
  return {
    success: true,
    orderId: data?.id,
    documentId: data?.documentId ?? documentId,
  };
}

export interface ReviewItem {
  productId: string;
  dignities?: string;
  disadvantages?: string;
  cooperation?: string;
  score: number;
}

export interface SubmitReviewInput {
  documentId: string;
  reviews: ReviewItem[];
  productFiles: Map<number, File[]>;
}

async function sendReviewTelegramNotification(
  orderDocumentId: string,
  order: {
    id: number;
    documentId: string;
    contact?: { phone?: string; email?: string } | null;
    tovary?: Array<{ tovar?: { name: string; documentId: string } }>;
  },
  reviews: Array<{ id: number; score?: number; product?: number | { data?: { id: number } } }>,
  buyerId: number | null
): Promise<boolean> {
  let buyerName = "Анонимный пользователь";
  if (buyerId) {
    const buyerResult = await getStrapiRecords("buyers", {
      "filters[id][$eq]": buyerId,
      publicationState: "live",
    });
    if (buyerResult.data?.[0]) {
      buyerName = buyerResult.data[0].name ?? buyerName;
    }
  }

  const reviewsTextArray = await Promise.all(
    reviews.map(async (review) => {
      let productId: number | null = null;
      if (typeof review.product === "number") productId = review.product;
      else if (
        typeof review.product === "object" &&
        review.product &&
        "data" in review.product &&
        review.product.data &&
        typeof (review.product as { data?: { id: number } }).data?.id === "number"
      ) {
        productId = (review.product as { data: { id: number } }).data.id;
      }
      const score = review.score ?? "N/A";
      let productName = "Товар";
      if (productId) {
        const productResult = await getStrapiRecords("tovaries", {
          "filters[id][$eq]": productId,
          publicationState: "live",
        });
        if (productResult.data?.[0]) {
          productName = productResult.data[0].name ?? productName;
        }
      }
      return `• ${productName} - Оценка: ${score}/5`;
    })
  );

  const message = `
⭐ *Новый отзыв о заказе* (ID: ${orderDocumentId})

👤 *Автор:* ${buyerName}
📋 *Заказ:* #${orderDocumentId}
${order.contact?.phone ? `📞 *Телефон:* ${order.contact.phone}` : ""}
${order.contact?.email ? `📧 *Email:* ${order.contact.email}` : ""}

📝 *Отзывы о товарах:*
${reviewsTextArray.join("\n")}

📊 *Всего отзывов:* ${reviews.length}
📅 *Дата:* ${new Date().toLocaleString("ru-RU")}
  `;

  return sendTelegramMessage(message, { parse_mode: "Markdown" });
}

function generateBuyerName(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const randomLetters = Array.from(
    { length: 2 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join("");
  const randomNumbers = Array.from(
    { length: 5 },
    () => numbers[Math.floor(Math.random() * numbers.length)]
  ).join("");
  return `Инженер-${randomLetters}${randomNumbers}`;
}

export async function submitOrderReviewLogic(
  input: SubmitReviewInput
): Promise<{
  success: boolean;
  reviews?: unknown[];
  error?: string;
}> {
  const { documentId, reviews: reviewsData, productFiles } = input;

  const orderResult = await getOrderByDocumentId(documentId);
  if (!orderResult.data || orderResult.data.length === 0) {
    return { success: false, error: "Заказ не найден" };
  }

  const order = orderResult.data[0] as {
    id: number;
    documentId: string;
    statuses: string;
    contact?: { email?: string } | null;
    tovary?: Array<{ tovar?: { name: string; documentId: string }; count?: number }>;
  };

  if (order.statuses === "Оставлен отзыв") {
    return { success: false, error: "Отзыв для этого заказа уже оставлен" };
  }
  if (order.statuses !== "Завершен") {
    return {
      success: false,
      error: "Отзыв можно оставить только для завершенных заказов",
    };
  }

  let buyerId: number | null = null;
  const buyerEmail = order.contact?.email;

  if (buyerEmail) {
    const buyerResult = await getStrapiRecords("buyers", {
      "filters[email][$eq]": buyerEmail,
      publicationState: "live",
    });
    if (buyerResult.data?.[0]) {
      buyerId = buyerResult.data[0].id;
    } else {
      const createResult = await createStrapiRecord("buyers", {
        name: generateBuyerName(),
        email: buyerEmail,
        publishedAt: new Date().toISOString(),
      });
      buyerId = createResult?.data?.id ?? null;
    }
  } else {
    const createResult = await createStrapiRecord("buyers", {
      name: generateBuyerName(),
      publishedAt: new Date().toISOString(),
    });
    buyerId = createResult?.data?.id ?? null;
  }

  const orderItems = (order.tovary || []).map(
    (item: {
      tovar?: { name?: string; documentId?: string; price?: number };
      count?: number;
    }) => ({
      name: item.tovar?.name || "Товар",
      documentId: item.tovar?.documentId || "",
      count: item.count || 0,
      sum: (item.tovar?.price || 0) * (item.count || 0),
    })
  ) as OrderItem[];

  const createdReviews: unknown[] = [];

  for (let i = 0; i < reviewsData.length; i++) {
    const reviewData = reviewsData[i];
    let uploadedFileIds: number[] = [];
    const files = productFiles.get(i);
    if (files?.length) {
      const uploadFormData = new FormData();
      for (const file of files) {
        uploadFormData.append("files", file);
      }
      uploadedFileIds = await uploadStrapiFiles(uploadFormData);
    }

    const productResult = await getStrapiRecords("tovaries", {
      "filters[documentId][$eq]": reviewData.productId,
      publicationState: "live",
    });
    if (!productResult.data?.[0]) continue;
    const productDocumentId = productResult.data[0].documentId;

    let buyerDocumentId: string | null = null;
    if (buyerId) {
      const buyerRes = await getStrapiRecords("buyers", {
        "filters[id][$eq]": buyerId,
        publicationState: "live",
      });
      if (buyerRes.data?.[0]) buyerDocumentId = buyerRes.data[0].documentId;
    }

    const reviewPayload: Record<string, unknown> = {
      dignities: reviewData.dignities || null,
      disadvantages: reviewData.disadvantages || null,
      cooperation: reviewData.cooperation || null,
      score: reviewData.score,
      product: productDocumentId,
      order: order.documentId,
      publishedAt: new Date().toISOString(),
    };
    if (buyerDocumentId) reviewPayload.buyer = buyerDocumentId;
    if (uploadedFileIds.length > 0) reviewPayload.files = uploadedFileIds;

    const reviewResult = await createStrapiRecord("reviews", reviewPayload);
    if (reviewResult?.data) createdReviews.push(reviewResult.data);
  }

  if (createdReviews.length > 0) {
    await updateStrapiRecord("zakazies", order.documentId, {
      statuses: "Оставлен отзыв",
      publishedAt: new Date().toISOString(),
    });
    await sendReviewTelegramNotification(
      documentId,
      order,
      createdReviews as Array<{ id: number; score?: number; product?: number | { data?: { id: number } } }>,
      buyerId
    );
  }

  return { success: true, reviews: createdReviews };
}
