"use client";

import { useCartStore } from "@/entities/cart/model/store";
import { CartItem } from "@/entities/cart-item";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/widgets/breadcrumbs";
import { cookieStorage } from "@/shared/lib/cookieStorage";
import styles from "./CartPage.module.scss";

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const currentOrderDocumentId = useCartStore(
    (state) => state.currentOrderDocumentId
  );
  const setCurrentOrderDocumentId = useCartStore(
    (state) => state.setCurrentOrderDocumentId
  );
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  // Функция для сравнения товаров в корзине и заказе
  const compareCartWithOrder = (
    cartItems: typeof items,
    orderItems: Array<{
      count: number;
      tovar?: {
        documentId: string;
      };
    }>
  ): boolean => {
    if (cartItems.length !== orderItems.length) {
      return false;
    }

    // Создаем Map для быстрого сравнения
    const cartMap = new Map<string, number>();
    cartItems.forEach((item) => {
      cartMap.set(item.id, item.quantity);
    });

    const orderMap = new Map<string, number>();
    orderItems.forEach((item) => {
      if (item.tovar?.documentId) {
        orderMap.set(item.tovar.documentId, item.count);
      }
    });

    // Сравниваем количество товаров
    if (cartMap.size !== orderMap.size) {
      return false;
    }

    for (const [documentId, quantity] of cartMap.entries()) {
      if (orderMap.get(documentId) !== quantity) {
        return false;
      }
    }

    return true;
  };

  const handleOrderClick = async () => {
    if (items.length > 0 && !isCreating) {
      setIsCreating(true);
      try {
        // Проверяем, есть ли уже связанный заказ
        const existingOrderId =
          currentOrderDocumentId ||
          cookieStorage.getItem("current-order-document-id");

        if (existingOrderId) {
          // Получаем существующий заказ
          const orderResponse = await fetch(`/api/order/${existingOrderId}`);
          if (orderResponse.ok) {
            const orderResult = await orderResponse.json();
            const order = orderResult.data;

            // Проверяем, совпадают ли товары
            const orderItems = order.tovary || [];
            const itemsMatch = compareCartWithOrder(items, orderItems);

            if (itemsMatch) {
              // Товары совпадают - открываем существующий заказ
              console.log("Товары совпадают, открываем существующий заказ");
              router.push(`/order/${existingOrderId}`);
              setIsCreating(false);
              return;
            } else {
              // Товары не совпадают - создаем новый заказ
              console.log("Товары не совпадают, создаем новый заказ");
            }
          } else {
            // Заказ не найден - создаем новый
            console.log("Заказ не найден, создаем новый");
          }
        }

        // Создаем новый черновик заказа
        const orderData = items.map((item) => ({
          name: item.title,
          documentId: item.id,
          count: item.quantity,
          sum: item.price * item.quantity,
        }));

        const response = await fetch("/api/order/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order: orderData }),
        });

        if (!response.ok) {
          throw new Error("Ошибка создания заказа");
        }

        const result = await response.json();

        if (result.success && result.documentId) {
          // Сохраняем documentId заказа в store и куки
          setCurrentOrderDocumentId(result.documentId);
          cookieStorage.setItem("current-order-document-id", result.documentId);

          // Переходим на страницу оформления заказа
          // Используем documentId для маршрута
          router.push(`/order/${result.documentId}`);
        } else {
          throw new Error("Не удалось получить ID заказа");
        }
      } catch (error) {
        console.error("Ошибка создания заказа:", error);
        alert("Произошла ошибка при создании заказа. Попробуйте еще раз.");
        setIsCreating(false);
      }
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs name="Корзина" />
          </div>
          <h1 className={styles.title}>Корзина</h1>

          {items.length > 0 ? (
            <div className={styles.content}>
              <div className={styles.itemsGrid}>
                {items.map((item) => (
                  <CartItem key={item.id} id={item.id} item={item} />
                ))}
              </div>

              <div className={styles.orderWidget}>
                <div className={styles.orderSummary}>
                  <h3 className={styles.orderTitle}>Ваш заказ</h3>
                  <ul className={styles.itemsList}>
                    {items.map((item) => (
                      <li key={item.id} className={styles.orderItem}>
                        <span className={styles.itemName}>{item.title}</span>
                        <span className={styles.itemPrice}>
                          {formattedPrice(item.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className={styles.totalPrice}>
                    Итого: <b>{formattedPrice(totalPrice)}</b>
                  </div>
                </div>
                <button
                  className={styles.orderButton}
                  onClick={handleOrderClick}
                  disabled={isCreating}
                >
                  {isCreating ? "Создание заказа..." : "Оформить заказ"}
                </button>
                <div className={styles.mobileOrderWidget}>
                  <div className={styles.mobileTotalPrice}>
                    Итого: <b>{formattedPrice(totalPrice)}</b>
                  </div>
                  <button
                    className={styles.orderButton}
                    onClick={handleOrderClick}
                    disabled={isCreating}
                  >
                    {isCreating ? "Создание заказа..." : "Оформить заказ"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Корзина пуста</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
