/**
 * Логика создания вопроса по товару. Для использования из Server Actions.
 */

import { getStrapiRecords, createStrapiRecord } from "@/shared/lib/api/strapi";

export interface ProductAskData {
  title: string;
  question: string;
  email?: string | null;
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

export async function submitProductAskLogic(
  productDocumentId: string,
  data: ProductAskData
): Promise<{
  success: boolean;
  message?: string;
  ask?: unknown;
  error?: string;
}> {
  const productResult = await getStrapiRecords("tovaries", {
    "filters[documentId][$eq]": productDocumentId,
    publicationState: "live",
  });

  if (!productResult.data || productResult.data.length === 0) {
    return { success: false, error: "Товар не найден" };
  }

  const product = productResult.data[0];
  let buyerDocumentId: string | null = null;

  if (data.email) {
    const buyerResult = await getStrapiRecords("buyers", {
      "filters[email][$eq]": data.email,
      publicationState: "live",
    });

    if (buyerResult.data?.[0]) {
      buyerDocumentId = buyerResult.data[0].documentId;
    } else {
      const createResult = await createStrapiRecord("buyers", {
        name: generateBuyerName(),
        email: data.email,
        publishedAt: new Date().toISOString(),
      });
      buyerDocumentId = createResult?.data?.documentId ?? null;
    }
  } else {
    const createResult = await createStrapiRecord("buyers", {
      name: generateBuyerName(),
      publishedAt: new Date().toISOString(),
    });
    buyerDocumentId = createResult?.data?.documentId ?? null;
  }

  const askPayload: Record<string, unknown> = {
    ask: data.title,
    ask_text: data.question,
    product: product.documentId,
    publishedAt: new Date().toISOString(),
  };
  if (buyerDocumentId) {
    askPayload.buyer = buyerDocumentId;
  }

  const askResult = await createStrapiRecord("asks", askPayload);

  return {
    success: true,
    message: "Вопрос успешно создан",
    ask: askResult?.data,
  };
}
