"use server";

import { searchProductsLogic } from "./searchLogic";
import type { SearchType } from "./searchLogic";
import { getProductsBySlug } from "./server";
import { submitProductAskLogic } from "./productAskLogic";

export async function searchProducts(params: {
  q: string;
  type?: SearchType;
  page?: number;
  pageSize?: number;
}) {
  if (!params.q?.trim()) {
    return {
      data: { products: undefined, blogs: undefined },
      query: params.q,
    };
  }
  return searchProductsLogic({
    q: params.q,
    type: params.type ?? "all",
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 24,
  });
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await getProductsBySlug(slug);
    if (!product) {
      return { data: null, error: "Товар не найден" };
    }
    return { data: product };
  } catch (error) {
    console.error("getProductBySlug:", error);
    return { data: null, error: "Товар не найден" };
  }
}

export async function submitProductAsk(
  productDocumentId: string,
  formData: FormData
) {
  const title = formData.get("title") as string;
  const question = formData.get("question") as string;
  const email = (formData.get("email") as string) || null;

  if (!title || !question) {
    return { success: false, error: "Не все обязательные поля заполнены" };
  }

  return submitProductAskLogic(productDocumentId, {
    title,
    question,
    email: email || undefined,
  });
}
