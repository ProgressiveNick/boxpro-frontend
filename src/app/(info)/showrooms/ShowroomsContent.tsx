"use client";

import Image from "next/image";
import { useTestFormStore } from "@/widgets/test-form/model/store";
import styles from "./Showrooms.module.scss";

const SHOWROOM_IMAGES = [
  "/img/showrooms/6I8A2995.jpg",
  "/img/showrooms/6I8A3049.jpg",
  "/img/showrooms/6I8A3110.jpg",
  "/img/showrooms/mskdemo_11_.jpg",
  "/img/showrooms/mskdemo_1_.jpg",
  "/img/showrooms/mskdemo_2_.jpg",
  "/img/showrooms/mskdemo_3_.jpg",
] as const;

export function ShowroomsContent() {
  const openForm = useTestFormStore((s) => s.openForm);

  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headline}>
          <h1 className={styles.title}>Шоу-румы</h1>
        </div>

        <div className={styles.introBlock}>
          <div className={styles.introText}>
            <p className={styles.text}>
              Надоело покупать оборудование «наугад»? Предлагаем заменить
              предположения на конкретику. В нашем шоу-руме ваш продукт встречается
              с техникой, подобранной под него: хрустящие снеки, нежные десерты,
              капризные полуфабрикаты — найдём подход к любому. Привозите самый
              сложный образец, и мы покажем, что для него возможно подобрать
              решение.
            </p>
            <p className={styles.text}>
              Не получается приехать? Отправьте образцы — мы проведём виртуальную
              экскурсию с полным видеоотчётом. Вы увидите, как ваши продукты проходят
              упаковку и обработку в реальном времени. Мы не только покажем
              оборудование бесплатно — предложим решение под ваши задачи.
            </p>
            <div className={styles.ctaBlock}>
              <p className={styles.ctaText}>
                Хотите увидеть оборудование в работе? Запишитесь на тест-драйв!
              </p>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={openForm}
              >
                Записаться на тестирование
              </button>
            </div>
          </div>
          <div className={styles.introImage}>
            <Image
              src="/img/showrooms/mskdemo_1_.jpg"
              alt="Входная группа шоу-рума BoxPro"
              width={600}
              height={400}
              className={styles.introImageImg}
            />
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.contactRow}>
          <div className={styles.contactItem}>
            <div>
              <p className={styles.contactLabel}>Адрес:</p>
              <p className={styles.contactValue}>
                ш. Энтузиастов, д. 56, стр. 32
              </p>
            </div>
          </div>
          <div className={styles.contactItem}>
            <div>
              <p className={styles.contactLabel}>Режим работы:</p>
              <p className={styles.contactValue}>Пн-Пт 09:00 - 18:00</p>
            </div>
          </div>
        </div>

        <div className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>Фотографии шоу-рума</h2>
          <div className={styles.gallery}>
            {SHOWROOM_IMAGES.map((src) => (
              <div key={src} className={styles.galleryItem}>
                <Image
                  src={src}
                  alt="Шоу-рум BoxPro"
                  fill
                  className={styles.galleryImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
