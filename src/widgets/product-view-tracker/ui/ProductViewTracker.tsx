"use client";

import { useTrackProductView } from "@/entities/product/model/use-track-product-view";
import { ProductType } from "@/entities/product";

type ProductViewTrackerProps = {
  product: ProductType | null | undefined;
};

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useTrackProductView(product);
  return null;
}
