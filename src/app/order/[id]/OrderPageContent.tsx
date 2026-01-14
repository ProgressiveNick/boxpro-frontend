"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderForm } from "@/features/order-form";
import { formattedPrice } from "@/entities/product/lib/formattedPrice";
import styles from "./OrderPage.module.scss";

interface OrderPageContentProps {
  orderId: string;
}

interface OrderData {
  id: number;
  documentId: string;
  statuses: string;
  sum: number;
  tovary?: Array<{
    count: number;
    tovar?: {
      name: string;
      documentId: string;
      price: number;
    };
  }>;
}

export function OrderPageContent({ orderId }: OrderPageContentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/order/${orderId}`);
        if (!response.ok) {
          throw new Error("Заказ не найден");
        }
        const result = await response.json();
        const orderData = result.data;
        setOrder(orderData);

        // Если заказ уже обработан (статус не "Не оформлен"), перенаправляем на страницу успеха
        if (orderData.statuses && orderData.statuses !== "Не оформлен") {
          router.push(`/order/${orderId}/success`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки заказа");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleSubmit = async () => {
    // После успешного оформления переходим на страницу успеха
    router.push(`/order/${orderId}/success`);
  };

  const handleSuccess = () => {
    router.push(`/order/${orderId}/success`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.loading}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.errorState}>
            <p className={styles.errorText}>{error || "Заказ не найден"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Вычисляем общую сумму из товаров
  const totalSum =
    order.tovary?.reduce((sum, item) => {
      const itemPrice = item.tovar?.price || 0;
      const itemCount = item.count || 0;
      return sum + itemPrice * itemCount;
    }, 0) ||
    order.sum ||
    0;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Оформление заказа</h1>
        <div className={styles.orderInfo}>
          <p className={styles.orderNumber}>
            Номер заказа: #{order.documentId || order.id}
          </p>
          {order.tovary && order.tovary.length > 0 && (
            <div className={styles.itemsList}>
              <ul className={styles.itemsListUl}>
                {order.tovary.map((item, index) => {
                  const itemPrice = item.tovar?.price || 0;
                  const itemCount = item.count || 0;
                  const itemTotal = itemPrice * itemCount;
                  return (
                    <li key={index} className={styles.orderItem}>
                      <span className={styles.itemName}>
                        {item.tovar?.name || "Товар"}
                      </span>
                      <span className={styles.itemPrice}>
                        {formattedPrice(itemTotal)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.totalPrice}>
                Итого: <b>{formattedPrice(totalSum)}</b>
              </div>
            </div>
          )}
        </div>
        <div className={styles.formWrapper}>
          <OrderForm
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            onSuccess={handleSuccess}
            orderId={orderId}
          />
        </div>
      </div>
    </div>
  );
}




