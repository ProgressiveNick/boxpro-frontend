"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./OrderSuccessPage.module.scss";

interface OrderSuccessPageContentProps {
  orderId: string;
}

interface OrderData {
  id: number;
  documentId: string;
  statuses: string;
  sum: number;
}

const ORDER_STAGES = [
  { status: "Не оформлен", label: "Заказ создан", completed: false },
  { status: "Не обработан", label: "Заказ создан", completed: true },
  { status: "В обработке", label: "Заказ обрабатывается", completed: false },
  { status: "Оплачен", label: "Заказ оплачен", completed: false },
  { status: "Отгружен", label: "Заказ отгружен", completed: false },
  { status: "Завершен", label: "Заказ завершен", completed: false },
];

export function OrderSuccessPageContent({
  orderId,
}: OrderSuccessPageContentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/order/${orderId}`);
        if (!response.ok) {
          // Если заказ не найден, показываем ошибку
          setLoading(false);
          return;
        }
        const result = await response.json();
        const orderData = result.data;
        setOrder(orderData);

        // Если заказ в статусе "Завершен" или "Оставлен отзыв" - перенаправляем на страницу отзыва
        if (
          orderData.statuses === "Завершен" ||
          orderData.statuses === "Оставлен отзыв"
        ) {
          router.replace(`/order/${orderId}/review`);
          return;
        }
      } catch (error) {
        console.error("Ошибка загрузки заказа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const getCurrentStageIndex = () => {
    if (!order) return 0;
    const index = ORDER_STAGES.findIndex(
      (stage) => stage.status === order.statuses
    );
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = getCurrentStageIndex();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <p className={styles.loading}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m9 11 3 3L22 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className={styles.successTitle}>Спасибо за ваш заказ!</h1>
          {order && (
            <p className={styles.orderNumber}>
              Номер заказа: <b>#{order.documentId || order.id}</b>
            </p>
          )}
          <p className={styles.successMessage}>
            В течение 5 минут с вами свяжется наш менеджер для подтверждения
            заказа
          </p>
        </div>

        <div className={styles.stagesSection}>
          <h2 className={styles.stagesTitle}>Этапы выполнения заказа</h2>
          <div className={styles.stagesList}>
            {ORDER_STAGES.map((stage, index) => {
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div
                  key={stage.status}
                  className={`${styles.stageItem} ${
                    isCompleted ? styles.completed : ""
                  } ${isCurrent ? styles.current : ""}`}
                >
                  <div className={styles.stageIcon}>
                    {isCompleted ? (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    )}
                  </div>
                  <div className={styles.stageContent}>
                    <h3 className={styles.stageLabel}>{stage.label}</h3>
                    {isCurrent && (
                      <p className={styles.stageStatus}>Текущий этап</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href="/catalog" className={styles.backButton}>
            Вернуться в каталог
          </Link>
          <Link href="/" className={styles.homeButton}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}




