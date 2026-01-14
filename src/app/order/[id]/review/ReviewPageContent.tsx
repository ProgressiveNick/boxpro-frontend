"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/shared/ui/FileUpload/FileUpload";
import { Button } from "@/shared/ui/button/Button";
import styles from "./ReviewPage.module.scss";

interface ReviewPageContentProps {
  orderDocumentId: string;
}

interface OrderData {
  id: number;
  documentId: string;
  statuses: string;
  tovary?: Array<{
    count: number;
    tovar?: {
      name: string;
      documentId: string;
      price: number;
    };
  }>;
  review?: {
    id?: number;
    documentId?: string;
    [key: string]: unknown;
  };
}

interface ProductReview {
  productId: string;
  productName: string;
  dignities: string;
  disadvantages: string;
  cooperation: string;
  score: number;
  files: File[];
}

export function ReviewPageContent({ orderDocumentId }: ReviewPageContentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reviews, setReviews] = useState<Record<string, ProductReview>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/order/${orderDocumentId}`);
        if (!response.ok) {
          throw new Error("Заказ не найден");
        }
        const result = await response.json();
        const orderData = result.data;

        // Проверяем статус заказа
        if (orderData.statuses === "Оставлен отзыв") {
          setError("Отзыв для этого заказа уже оставлен");
          setLoading(false);
          return;
        }

        if (orderData.statuses !== "Завершен") {
          setError("Отзыв можно оставить только для завершенных заказов");
          setLoading(false);
          return;
        }

        setOrder(orderData);

        // Инициализируем отзывы для каждого товара
        const initialReviews: Record<string, ProductReview> = {};
        if (orderData.tovary) {
          orderData.tovary.forEach(
            (item: {
              tovar?: {
                documentId?: string;
                name?: string;
              };
            }) => {
              if (item.tovar?.documentId) {
                initialReviews[item.tovar.documentId] = {
                  productId: item.tovar.documentId,
                  productName: item.tovar.name || "Товар",
                  dignities: "",
                  disadvantages: "",
                  cooperation: "",
                  score: 5,
                  files: [],
                };
              }
            }
          );
        }
        setReviews(initialReviews);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки заказа");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderDocumentId]);

  const updateReview = (
    productId: string,
    field: keyof ProductReview,
    value: string | number | File[]
  ) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Подготавливаем данные отзывов (без файлов)
      const reviewsData = Object.values(reviews).map((review) => ({
        productId: review.productId,
        dignities: review.dignities || undefined,
        disadvantages: review.disadvantages || undefined,
        cooperation: review.cooperation || undefined,
        score: review.score,
      }));

      formData.append("reviews", JSON.stringify(reviewsData));

      // Добавляем файлы для каждого товара
      Object.values(reviews).forEach((review, index) => {
        if (review.files && review.files.length > 0) {
          review.files.forEach((file) => {
            formData.append(`product_${index}_files`, file);
          });
        }
      });

      const response = await fetch(`/api/order/${orderDocumentId}/review`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка отправки отзывов");
      }

      // Показываем сообщение об успехе
      setSuccess(true);

      // Через 3 секунды перенаправляем на страницу успеха
      setTimeout(() => {
        router.push(`/order/${orderDocumentId}/success`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки отзывов");
    } finally {
      setSubmitting(false);
    }
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

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.successState}>
            <h2 className={styles.successTitle}>Отзыв успешно оставлен!</h2>
            <p className={styles.successText}>
              Спасибо за ваш отзыв. Вы будете перенаправлены на страницу
              заказа...
            </p>
          </div>
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
            <Button
              text="Вернуться назад"
              onClick={() => router.back()}
              className={styles.backButton}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Оставить отзыв</h1>
        <p className={styles.subtitle}>
          Поделитесь своим мнением о товарах из заказа #{order.documentId}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {order.tovary && order.tovary.length > 0 && (
            <div className={styles.productsList}>
              {order.tovary.map((item) => {
                const productId = item.tovar?.documentId;
                if (!productId || !reviews[productId]) return null;

                const review = reviews[productId];

                return (
                  <div key={productId} className={styles.productReview}>
                    <h3 className={styles.productName}>
                      {item.tovar?.name || "Товар"}
                    </h3>

                    <div className={styles.ratingSection}>
                      <label className={styles.label}>Оценка (от 1 до 5)</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={review.score}
                        onChange={(e) =>
                          updateReview(
                            productId,
                            "score",
                            parseFloat(e.target.value)
                          )
                        }
                        className={styles.ratingSlider}
                      />
                      <div className={styles.ratingValue}>
                        {review.score.toFixed(1)}
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        Достоинства{" "}
                        <span className={styles.optional}>(необязательно)</span>
                      </label>
                      <textarea
                        value={review.dignities}
                        onChange={(e) =>
                          updateReview(productId, "dignities", e.target.value)
                        }
                        rows={4}
                        className={styles.textarea}
                        placeholder="Что вам понравилось в товаре?"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        Недостатки{" "}
                        <span className={styles.optional}>(необязательно)</span>
                      </label>
                      <textarea
                        value={review.disadvantages}
                        onChange={(e) =>
                          updateReview(
                            productId,
                            "disadvantages",
                            e.target.value
                          )
                        }
                        rows={4}
                        className={styles.textarea}
                        placeholder="Что можно улучшить?"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        О сотрудничестве{" "}
                        <span className={styles.optional}>(необязательно)</span>
                      </label>
                      <textarea
                        value={review.cooperation}
                        onChange={(e) =>
                          updateReview(productId, "cooperation", e.target.value)
                        }
                        rows={4}
                        className={styles.textarea}
                        placeholder="Как прошло сотрудничество с BoxPro?"
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        Фотографии{" "}
                        <span className={styles.optional}>(необязательно)</span>
                      </label>
                      <FileUpload
                        files={review.files}
                        onChange={(files) =>
                          updateReview(productId, "files", files)
                        }
                        maxFiles={5}
                        maxSize={10}
                        acceptedTypes={["image/*"]}
                        className={styles.fileUpload}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.formActions}>
            <Button
              type="button"
              text="Отмена"
              onClick={() => router.back()}
              className={styles.cancelButton}
            />
            <Button
              type="submit"
              text={submitting ? "Отправка..." : "Отправить отзыв"}
              disabled={submitting}
              className={styles.submitButton}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
