/**
 * Хелпер для отправки данных электронной коммерции в Яндекс Метрику через dataLayer.
 * @see https://yandex.ru/support/metrica/ru/ecommerce/data#product-list
 */

export const ECOMMERCE_CURRENCY = "RUB";

export type EcommerceProduct = {
  id: string;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
  variant?: string;
  list?: string;
  position?: number;
  quantity?: number;
  coupon?: string;
  discount?: number;
};

export type EcommerceActionField = {
  id: string;
  revenue?: number;
  coupon?: string;
  goal_id?: number;
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Безопасно отправляет eCommerce-объект в window.dataLayer для обработки Яндекс Метрикой.
 * Контейнер dataLayer должен быть в глобальной области; при инициализации с ecommerce: true
 * используется стандартное имя dataLayer.
 */
export function pushEcommerceEvent(ecommerce: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  dataLayer.push({ ecommerce });
  if (process.env.NODE_ENV === "development") {
    console.debug("[Yandex Ecommerce]", ecommerce);
  }
}
