import type { Metadata } from "next";
import {
  PopularProducts,
  CategoriesCards,
  ContactsBlock,
  AdvantagesBlock,
  PromoBanner,
} from "@/widgets/server-widgets";
import { generateSEO } from "@/shared/lib/seo-utils";
import { getPopularProducts } from "@/entities/product/server";
import { RecentlyViewedBlock } from "@/widgets/recently-viewed-block";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;
//тестовый коммит
export const metadata: Metadata = generateSEO({
  title: "BoxPro - упаковочное и производственное оборудование | Главная",
  description:
    "Купить упаковочное и производственное оборудование в России. Большой каталог товаров, услуги по обслуживанию и ремонту оборудования. Доставка по всей РФ.",
  keywords:
    "упаковочное оборудование, производственное оборудование, фасовка, упаковка, ремонт оборудования, обслуживание оборудования",
});

export default async function HomePage() {
  // Получаем популярные товары из указанных категорий
  const popularProducts = await getPopularProducts();

  return (
    <>
      <PromoBanner />
      <CategoriesCards />
      <PopularProducts products={popularProducts} />
      <RecentlyViewedBlock />
      <AdvantagesBlock />
      <ContactsBlock />
    </>
  );
}
