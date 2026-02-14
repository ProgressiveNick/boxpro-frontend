import { unstable_cache } from "next/cache";
import { getPopularProducts } from "@/entities/product/server";
import { PopularProducts as PopularProductsSlider } from "./ui/PopularProducts";

const REVALIDATE_SECONDS = 86400; // 24 часа

async function getCachedPopularProducts() {
  return unstable_cache(
    async () => getPopularProducts(),
    ["popular-products"],
    { revalidate: REVALIDATE_SECONDS },
  )();
}

export async function PopularProducts() {
  const products = await getCachedPopularProducts();
  return <PopularProductsSlider products={products} />;
}
