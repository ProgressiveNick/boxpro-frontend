"use client";

import { useEffect } from "react";
import { useUIStore } from "@/shared/store/useUIStore";

export function GlobalUICloseHandler() {
  const activeUI = useUIStore((s) => s.activeUI);
  const closeAll = useUIStore((s) => s.closeAll);

  useEffect(() => {
    if (activeUI === null) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const surface = document.querySelector(
        `[data-ui-surface="${activeUI}"]`,
      );
      if (!surface || surface.contains(target)) return;
      // Не закрывать по клику на триггер того же UI (кнопка каталога и т.д.),
      // иначе закрытие и повторный click откроют снова
      const trigger = document.querySelector(
        `[data-ui-trigger="${activeUI}"]`,
      );
      if (trigger?.contains(target)) return;
      closeAll();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [activeUI, closeAll]);

  return null;
}
