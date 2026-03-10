"use server";

import {
  submitOrderLogic,
  getOrderLogic,
  createOrderDraftLogic,
  updateOrderLogic,
  submitOrderReviewLogic,
  type OrderItem,
  type FormFile,
  type UpdateOrderData,
  type ReviewItem,
} from "./orderLogic";

export async function getOrder(documentId: string) {
  return getOrderLogic(documentId);
}

export async function submitOrder(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || undefined;
  const orderJson = formData.get("order") as string;
  const files = formData.getAll("files") as File[];

  let order: OrderItem[];
  try {
    order = JSON.parse(orderJson) as OrderItem[];
  } catch {
    return { success: false, error: "Неверный формат данных заказа" };
  }

  if (!fullName || !phone || !order?.length) {
    return { success: false, error: "Не все обязательные поля заполнены или корзина пуста" };
  }

  const processedFiles: FormFile[] = [];
  for (const file of files) {
    if (file && "arrayBuffer" in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        buffer,
      });
    }
  }

  return submitOrderLogic({
    fullName,
    phone,
    paymentMethod,
    order,
    files: processedFiles,
  });
}

export async function createOrderDraft(orderItems: OrderItem[]) {
  if (!orderItems?.length) {
    return { success: false, error: "Корзина пуста" };
  }
  return createOrderDraftLogic(orderItems);
}

export async function updateOrder(
  documentId: string,
  formData: FormData
) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const paymentMethod = (formData.get("paymentMethod") as string) || undefined;
  const files = formData.getAll("files") as File[];

  if (!fullName || !phone) {
    return { success: false, error: "Не все обязательные поля заполнены" };
  }

  const processedFiles: FormFile[] = [];
  for (const file of files) {
    if (file && "arrayBuffer" in file) {
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
    paymentMethod,
    files: processedFiles,
  };

  const orderResult = await getOrderLogic(documentId);
  if (orderResult.error || !orderResult.data) {
    return { success: false, error: orderResult.error ?? "Заказ не найден" };
  }

  const order = orderResult.data as {
    tovary?: Array<{
      tovar?: { name?: string; documentId?: string; price?: number };
      count?: number;
    }>;
  };

  const orderItems: OrderItem[] = (order.tovary || []).map(
    (item: {
      tovar?: { name?: string; documentId?: string; price?: number };
      count?: number;
    }) => ({
      name: item.tovar?.name || "Товар",
      documentId: item.tovar?.documentId || "",
      count: item.count || 0,
      sum: (item.tovar?.price || 0) * (item.count || 0),
    })
  );

  return updateOrderLogic(documentId, updateData, orderItems);
}

export async function submitOrderReview(
  documentId: string,
  formData: FormData
) {
  const reviewsData = formData.get("reviews") as string;
  if (!reviewsData) {
    return { success: false, error: "Данные отзывов не предоставлены" };
  }

  let reviews: ReviewItem[];
  try {
    reviews = JSON.parse(reviewsData) as ReviewItem[];
  } catch {
    return { success: false, error: "Неверный формат отзывов" };
  }

  for (const review of reviews) {
    if (!review.productId || review.score == null) {
      return { success: false, error: "Не все обязательные поля заполнены" };
    }
    if (review.score < 1 || review.score > 5) {
      return { success: false, error: "Оценка должна быть от 1 до 5" };
    }
  }

  const productFiles = new Map<number, File[]>();
  for (let i = 0; i < reviews.length; i++) {
    const files = formData.getAll(`product_${i}_files`) as File[];
    if (files?.length) {
      productFiles.set(i, files.filter((f) => f && "arrayBuffer" in f));
    }
  }

  return submitOrderReviewLogic({
    documentId,
    reviews,
    productFiles,
  });
}
