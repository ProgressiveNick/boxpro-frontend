import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewPageContent } from "./ReviewPageContent";
import { getStrapiRecords } from "@/shared/lib/api/strapi";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Оставить отзыв на заказ #${id} | BoxPro`,
    description: "Оставьте отзыв о вашем заказе на BoxPro",
  };
}

export default async function ReviewPage({ params }: { params: Params }) {
  const { id } = await params;
  // id здесь - это documentId заказа

  // Проверяем статус заказа на сервере
  try {
    const orderResult = await getStrapiRecords("zakazies", {
      "filters[documentId][$eq]": id,
      publicationState: "live",
    });

    if (!orderResult.data || orderResult.data.length === 0) {
      // Пробуем без publicationState (для черновиков)
      const draftResult = await getStrapiRecords("zakazies", {
        "filters[documentId][$eq]": id,
      });

      if (!draftResult.data || draftResult.data.length === 0) {
        notFound();
      }

      const order = draftResult.data[0];

      // Если заказ в статусе "Оставлен отзыв" - возвращаем 404
      if (order.statuses === "Оставлен отзыв") {
        notFound();
      }
    } else {
      const order = orderResult.data[0];

      // Если заказ в статусе "Оставлен отзыв" - возвращаем 404
      if (order.statuses === "Оставлен отзыв") {
        notFound();
      }
    }
  } catch (error) {
    console.error("Ошибка проверки статуса заказа:", error);
    // Продолжаем рендеринг, проверка будет на клиенте
  }

  return <ReviewPageContent orderDocumentId={id} />;
}
