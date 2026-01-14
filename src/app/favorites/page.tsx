import type { Metadata } from "next";
import { FavoritesPageContent } from "./FavoritesPageContent";

export const metadata: Metadata = {
  title: "Избранное | BoxPro",
  description: "Ваши избранные товары на BoxPro",
};

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}





