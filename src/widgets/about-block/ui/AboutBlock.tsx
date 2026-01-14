import styles from "./AboutBlock.module.scss";

export function AboutBlock() {
  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.wrapperLeft}>
          <h2>О нас в цифрах</h2>
          <div className={styles.aboutFactWrapper}>
            <h4 className={styles.aboutFactNumber}>1 122</h4>
            <p className={styles.aboutFactText}>
              Доставляем оборудование по всем городам России
            </p>
          </div>
          <div className={styles.aboutFactWrapper}>
            <h4 className={styles.aboutFactNumber}>100 +</h4>
            <p className={styles.aboutFactText}>Типов оборудования</p>
          </div>
          <div className={styles.aboutFactWrapper}>
            <h4 className={styles.aboutFactNumber}>{`>17`}</h4>
            <p className={styles.aboutFactText}>Лет опыта нашей компании</p>
          </div>
          <div className={styles.aboutFactWrapper}>
            <h4 className={styles.aboutFactNumber}>3750+</h4>
            <p className={styles.aboutFactText}>Довольных клиентов</p>
          </div>
        </div>

        <div className={styles.wrapperRight}>
          <div className={styles.yandexMapWidjetWrapper}>
            <iframe
              className={styles.yandexMapWidjet}
              src="https://yandex.ru/maps-reviews-widget/159350292763?comments"
            ></iframe>
            <a
              href="https://yandex.ru/maps/org/sp_grupp/159350292763/"
              target="_blank"
              className={styles.yandexMapA}
            >
              СП Групп на карте Королёва — Яндекс Карты
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
