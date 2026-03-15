import type { Metadata } from "next";
import { ComparisonPageContent } from "./ComparisonPageContent";

export const metadata: Metadata = {
  title: "Сравнение товаров | BoxPro",
  description: "Сравнение выбранных товаров на BoxPro",
};

export default function ComparisonPage() {
  return <ComparisonPageContent />;
}
