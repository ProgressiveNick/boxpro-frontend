"use client";

import { useEffect } from "react";

/**
 * Прокручивает страницу вверх при монтировании.
 * Используется на странице товара, т.к. глобальный ScrollToTop может выполняться
 * до загрузки контента (loading → page), и скролл сбрасывается.
 */
export function ProductPageScroll() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return null;
}
