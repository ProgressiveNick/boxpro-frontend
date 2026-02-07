"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Отключаем авто-восстановление скролла браузером
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    scrollToTop();

    // Повторяем скролл: Next.js подменяет loading → контент асинхронно,
    // и скролл может сбрасываться. Повтор через rAF и таймауты ловит все фазы.
    const rafId = requestAnimationFrame(() => scrollToTop());
    const t1 = setTimeout(scrollToTop, 50);
    const t2 = setTimeout(scrollToTop, 150);
    const t3 = setTimeout(scrollToTop, 400);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  return null;
}
