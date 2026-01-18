export type ProductReviewsTab = "reviews" | "questions";

export function scrollToProductReviews(tab: ProductReviewsTab) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("product-reviews:switch-tab", {
      detail: { tab },
    })
  );

  const target = document.getElementById("product-reviews-block");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}
