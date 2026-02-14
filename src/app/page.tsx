import type { Metadata } from "next";
import {
  PopularProducts,
  CategoriesCards,
  ContactsBlock,
  AdvantagesBlock,
  PromoBanner,
} from "@/widgets/server-widgets";
import { generateSEO } from "@/shared/lib/seo-utils";
import { RecentlyViewedBlock } from "@/widgets/recently-viewed-block";

export const metadata: Metadata = generateSEO({
  title: "BoxPro - упаковочное и производственное оборудование ",
  description:
    "Упаковочное и производственное оборудование от производителя по всей России. Большой каталог товаров, услуги по обслуживанию и ремонту оборудования. Доставка по всей РФ.",
  keywords:
    "упаковочное оборудование, производственное оборудование, фасовочное оборудование, упаковочные машины, ремонт упаковочного оборудования, обслуживание оборудования, boxpro",
});

export default async function HomePage() {
  return (
    <>
      <PromoBanner />
      <CategoriesCards />
      <PopularProducts />
      <RecentlyViewedBlock />
      <AdvantagesBlock />
      <ContactsBlock />
    </>
  );
}
