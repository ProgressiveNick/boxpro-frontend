"use client";

import { useEffect, useState } from "react";
import { fetchProductBySlug } from "@/entities/product/api/api";
import { ProductType } from "@/entities/product";
import { useRecentlyViewedStore } from "@/entities/product/model/recently-viewed-store";

export function useRecentlyViewedProducts(currentProductSlug?: string) {
  const { items } = useRecentlyViewedStore();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      if (items.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Фильтруем текущий товар из списка
        const filteredItems = currentProductSlug
          ? items.filter((item) => item.slug !== currentProductSlug)
          : items;

        if (filteredItems.length === 0) {
          setIsLoading(false);
          return;
        }

        // Получаем товары по слагам через API
        const productsPromises = filteredItems.map((item) =>
          fetchProductBySlug(item.slug)
            .then((res) => res.data)
            .catch(() => null)
        );

        const productsData = await Promise.all(productsPromises);
        const validProducts = productsData.filter(
          (product): product is ProductType => product !== null
        );

        // Сохраняем порядок из filteredItems
        const orderedProducts = filteredItems
          .map((item) =>
            validProducts.find((product) => product.slug === item.slug)
          )
          .filter((product): product is ProductType => product !== undefined);

        setProducts(orderedProducts);
      } catch (error) {
        console.error("Ошибка загрузки просмотренных товаров:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [items, currentProductSlug]);

  return { products, isLoading };
}
