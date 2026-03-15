"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/shared/store/useUIStore";

/** Высота «маячка» в пикселях — совпадает с порогом скрытия верхней панели шапки */
const SENTINEL_HEIGHT_PX = 20;

/**
 * Невидимый блок у верха страницы. По его видимости (Intersection Observer)
 * определяем, проскроллил ли пользователь вниз — тогда скрываем верхнюю панель шапки.
 * Не зависит от того, по какому элементу идёт скролл.
 */
export function ScrollSentinel() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const setScrollPastThreshold = useUIStore((s) => s.setScrollPastThreshold);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;
        setScrollPastThreshold(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [setScrollPastThreshold]);

  return (
    <div style={{ position: "relative", height: 0, overflow: "visible" }}>
      <div
        ref={sentinelRef}
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: SENTINEL_HEIGHT_PX,
          width: "100%",
          pointerEvents: "none",
          visibility: "hidden",
          opacity: 0,
          background: "transparent",
          outline: "none",
        }}
      />
    </div>
  );
}
