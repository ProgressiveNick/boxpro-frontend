import type { Metadata } from "next";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = {
  title: "Корзина | BoxPro",
  description: "Ваша корзина покупок на BoxPro",
};

export default function CartPage() {
  return <CartPageContent />;
}





