import type { Metadata } from "next";
import { OrderPageContent } from "./OrderPageContent";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Оформление заказа #${id} | BoxPro`,
    description: "Оформление заказа на BoxPro",
  };
}

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderPageContent orderId={id} />;
}




