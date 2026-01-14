"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import styles from "./ProductReviewsBlock.module.scss";

import { ProductType, Review, Ask } from "@/entities/product";
import { Button } from "@/shared/ui/button/Button";
import { STRAPI_CLIENT_CONFIG } from "@/shared/config/api";

// Функция для форматирования даты
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Функция для получения инициалов из имени
function getInitials(name?: string): string {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Функция для вычисления статистики рейтингов
function calculateRatingStats(reviews: Review[]) {
  const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    const score = Math.round(review.score);
    if (score >= 1 && score <= 5) {
      stats[score as keyof typeof stats]++;
    }
  });

  const total = reviews.length;
  return Object.entries(stats)
    .reverse()
    .map(([score, count]) => ({
      score: Number(score),
      percent: total > 0 ? count / total : 0,
    }));
}

type ProductReviewsBlockProps = {
  product: ProductType;
};

export function ProductReviewsBlock({ product }: ProductReviewsBlockProps) {
  const reviews = product.reviews || [];
  const hasReviews = reviews.length > 0;

  // Если нет отзывов, показываем только вопрос-ответ
  const [activeTab, setActiveTab] = useState<"reviews" | "questions">(
    hasReviews ? "reviews" : "questions"
  );

  useEffect(() => {
    const handleSwitch = (event: Event) => {
      const customEvent = event as CustomEvent<{
        tab?: "reviews" | "questions";
      }>;
      const tab = customEvent.detail?.tab;
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener(
      "product-reviews:switch-tab",
      handleSwitch as EventListener
    );

    return () => {
      window.removeEventListener(
        "product-reviews:switch-tab",
        handleSwitch as EventListener
      );
    };
  }, []);

  return (
    <section id="product-reviews-block" className={styles.productReviewsBlock}>
      <div className={styles.tabsHead}>
        {hasReviews && (
          <button
            type="button"
            className={`${styles.tabButton} ${
              activeTab === "reviews" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы
          </button>
        )}
        <button
          type="button"
          className={`${styles.tabButton} ${
            activeTab === "questions" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("questions")}
        >
          Вопрос-ответ
        </button>
      </div>

      {activeTab === "reviews" && hasReviews ? (
        <ReviewsTabContent reviews={reviews} />
      ) : (
        <QuestionsTabContent product={product} />
      )}
    </section>
  );
}

type ReviewsTabContentProps = {
  reviews: Review[];
};

function ReviewsTabContent({ reviews }: ReviewsTabContentProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const ratingStats = calculateRatingStats(reviews);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
      : 0;

  return (
    <div className={styles.reviewsContent}>
      <ReviewsSummary
        totalReviews={reviews.length}
        rating={averageRating}
        ratingStats={ratingStats}
      />
      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onPreviewImage={setPreviewImage}
          />
        ))}
      </div>

      {previewImage && (
        <div
          className={styles.previewOverlay}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className={styles.previewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.previewClose}
              onClick={() => setPreviewImage(null)}
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>
            <Image
              src={previewImage}
              alt="Фотография отзыва"
              width={720}
              height={480}
              className={styles.previewImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}

type ReviewsSummaryProps = {
  totalReviews: number;
  rating: number;
  ratingStats: Array<{ score: number; percent: number }>;
};

function ReviewsSummary({
  totalReviews,
  rating,
  ratingStats,
}: ReviewsSummaryProps) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryRating}>
        <span className={styles.summaryValue}>{rating.toFixed(2)}</span>
        <div className={styles.summaryStars}>
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const filled = rating >= starValue;
            const hasHalf = rating + 1 > starValue && rating < starValue;

            return (
              <Star
                key={starValue}
                className={`${styles.starIcon} ${
                  filled ? styles.filledStar : hasHalf ? styles.halfStar : ""
                }`}
                size={18}
                strokeWidth={1.5}
              />
            );
          })}
        </div>
        <p className={styles.summaryCaption}>{totalReviews} отзывов</p>
      </div>

      <div className={styles.summaryProgress}>
        {ratingStats.map((stat) => (
          <div key={stat.score} className={styles.progressRow}>
            <span className={styles.progressLabel}>{stat.score}</span>
            <div className={styles.progressBar}>
              <span style={{ width: `${stat.percent * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ReviewCardProps = {
  review: Review;
  onPreviewImage: (src: string | null) => void;
};

function ReviewCard({ review, onPreviewImage }: ReviewCardProps) {
  const initials = useMemo(
    () => getInitials(review.buyer?.name),
    [review.buyer?.name]
  );

  const authorName = review.buyer?.name || "Анонимный пользователь";
  const reviewDate = formatDate(review.createdAt);
  // Переменные окружения валидируются в начале приложения через @/shared/lib/env-validation/init
  const strapiBaseUrl = STRAPI_CLIENT_CONFIG.imageURL;

  // Получаем URL изображений из Strapi
  const photoUrls = useMemo(() => {
    if (!review.files || review.files.length === 0) return [];
    return review.files.map((file) => {
      if (file.url.startsWith("http")) {
        return file.url;
      }
      return `${strapiBaseUrl}${file.url}`;
    });
  }, [review.files, strapiBaseUrl]);

  return (
    <article className={styles.reviewCard}>
      <header className={styles.reviewHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.reviewMeta}>
          <p className={styles.author}>{authorName}</p>
          <p className={styles.meta}>{reviewDate}</p>
        </div>
        <span className={styles.reviewBadge}>{review.score.toFixed(1)}</span>
      </header>

      {review.dignities && (
        <div className={styles.reviewSection}>
          <p className={styles.sectionTitle}>Достоинства</p>
          <p className={styles.sectionText}>{review.dignities}</p>
        </div>
      )}

      {review.disadvantages && (
        <div className={styles.reviewSection}>
          <p className={styles.sectionTitle}>Недостатки</p>
          <p className={styles.sectionText}>{review.disadvantages}</p>
        </div>
      )}

      {review.cooperation && (
        <div className={styles.reviewSection}>
          <p className={styles.sectionTitle}>О сотрудничестве</p>
          <p className={styles.sectionText}>{review.cooperation}</p>
        </div>
      )}

      {photoUrls.length > 0 && (
        <div className={styles.reviewFooter}>
          <div className={styles.reviewPhotos}>
            {photoUrls.map((photo, index) => (
              <button
                type="button"
                key={`${review.id}-${index}`}
                className={styles.photoThumb}
                onClick={() => onPreviewImage(photo)}
              >
                <Image src={photo} alt="Фото отзыва" width={80} height={80} />
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

type QuestionsTabContentProps = {
  product: ProductType;
};

function QuestionsTabContent({ product }: QuestionsTabContentProps) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [asks, setAsks] = useState<Ask[]>(product.asks || []);

  // Обновляем asks при изменении product.asks
  useEffect(() => {
    if (product.asks) {
      setAsks(product.asks);
    }
  }, [product.asks]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !question.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("question", question);
      if (email.trim()) {
        formData.append("email", email);
      }

      const response = await fetch(`/api/product/${product.documentId}/ask`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTitle("");
        setQuestion("");
        setEmail("");
        setSubmitSuccess(true);

        // Обновляем список вопросов, добавляя новый
        if (result.ask) {
          setAsks([result.ask, ...asks]);
        }

        // Скрываем сообщение об успехе через 3 секунды
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        const error = await response.json();
        console.error("Ошибка отправки вопроса:", error);
        alert("Ошибка отправки вопроса. Попробуйте еще раз.");
      }
    } catch (error) {
      console.error("Ошибка отправки вопроса:", error);
      alert("Ошибка отправки вопроса. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.questionsContent}>
      <div className={styles.questionsInfo}>
        <h4>Задайте вопрос</h4>
        <p>
          Мы помогаем подобрать оборудование и сопровождаем на всех этапах.
          Оставьте вопрос — инженер BoxPro ответит и подскажет, подходит ли{" "}
          {product.name} под вашу задачу.
        </p>
        <p>Среднее время ответа: до 24 часов.</p>
      </div>

      <div className={styles.questionsMain}>
        <form className={styles.questionForm} onSubmit={handleSubmit}>
          {submitSuccess && (
            <div className={styles.successMessage}>
              Вопрос успешно отправлен!
            </div>
          )}
          <label className={styles.formField}>
            <span>Заголовок</span>
            <input
              type="text"
              placeholder="Например, совместимость с конвейером"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className={styles.formField}>
            <span>Задайте вопрос или опишите проблему</span>
            <textarea
              rows={4}
              placeholder="Расскажите, что важно узнать"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </label>
          <label className={styles.formField}>
            <span>Email (необязательно)</span>
            <input
              type="email"
              placeholder="Ваш email для уведомлений"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <Button
            type="submit"
            text={isSubmitting ? "Отправка..." : "Опубликовать"}
            className={styles.publishButton}
            disabled={isSubmitting}
          />
        </form>

        <div className={styles.questionsList}>
          {asks.length === 0 ? (
            <p className={styles.noQuestions}>
              Пока нет вопросов. Будьте первым, кто задаст вопрос!
            </p>
          ) : (
            asks.map((ask) => <QuestionCard key={ask.id} ask={ask} />)
          )}
        </div>
      </div>
    </div>
  );
}

type QuestionCardProps = {
  ask: Ask;
};

function QuestionCard({ ask }: QuestionCardProps) {
  const initials = useMemo(
    () => getInitials(ask.buyer?.name),
    [ask.buyer?.name]
  );

  const authorName = ask.buyer?.name || "Анонимный пользователь";
  const questionDate = formatDate(ask.createdAt);

  return (
    <article className={styles.questionCard}>
      <header className={styles.questionHeader}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.reviewMeta}>
          <p className={styles.author}>{authorName}</p>
          <p className={styles.meta}>{questionDate}</p>
        </div>
      </header>
      <h5 className={styles.questionTitle}>{ask.ask}</h5>
      <p className={styles.sectionText}>{ask.ask_text}</p>

      {ask.unswer && (
        <div className={styles.answerBlock}>
          <p className={styles.answerAuthor}>BoxPro</p>
          <p className={styles.answerText}>{ask.unswer}</p>
        </div>
      )}
    </article>
  );
}
