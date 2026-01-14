"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

const MIN_LOADING_TIME = 300; // Минимальное время отображения загрузки в мс

/**
 * Хук для управления состоянием загрузки товаров
 */
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const prevSearchParamsRef = useRef<string>(searchParams.toString());
  const isLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingStartRef = useRef<number | null>(null);

  // Отслеживаем изменение searchParams и сбрасываем isLoading
  useEffect(() => {
    const currentSearchParams = searchParams.toString();
    const searchParamsChanged =
      prevSearchParamsRef.current !== currentSearchParams;

    if (searchParamsChanged) {
      prevSearchParamsRef.current = currentSearchParams;

      if (isLoading) {
        if (isLoadingTimeoutRef.current) {
          clearTimeout(isLoadingTimeoutRef.current);
        }

        const elapsedTime = isLoadingStartRef.current
          ? Date.now() - isLoadingStartRef.current
          : 0;
        const minLoadTime = Math.max(MIN_LOADING_TIME - elapsedTime, 0);

        isLoadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          isLoadingStartRef.current = null;
          isLoadingTimeoutRef.current = null;
        }, minLoadTime);
      }
    }

    return () => {
      if (isLoadingTimeoutRef.current) {
        clearTimeout(isLoadingTimeoutRef.current);
      }
    };
  }, [searchParams, isLoading]);

  const startLoading = () => {
    setIsLoading(true);
    isLoadingStartRef.current = Date.now();
    if (isLoadingTimeoutRef.current) {
      clearTimeout(isLoadingTimeoutRef.current);
      isLoadingTimeoutRef.current = null;
    }
  };

  return {
    isLoading,
    startLoading,
  };
}


