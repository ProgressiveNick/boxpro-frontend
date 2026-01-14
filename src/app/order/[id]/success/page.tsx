import type { Metadata } from "next";
import { OrderSuccessPageContent } from "./OrderSuccessPageContent";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Заказ оформлен #${id} | BoxPro`,
    description: "Ваш заказ успешно оформлен",
  };
}

export default async function OrderSuccessPage({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderSuccessPageContent orderId={id} />;
}




