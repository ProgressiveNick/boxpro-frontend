import styles from "./AdvantagesBlock.module.scss";
import { AdvantagesBlockCtaButton } from "./AdvantagesBlockCtaButton";

export function AdvantagesBlock() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.leftContainer}>
          <div className={styles.headContainer}>
            <h2 className={styles.title}>
              Выбирая нас, <span>вы выбираете качество</span>
            </h2>
            <p className={styles.description}>
              Мы предлагаем широкий ассортимент оборудования для упаковки и
              фасовки, а также услуги по обслуживанию и ремонту оборудования.
            </p>
          </div>
          <div className={styles.contentContainer}>
            <div className={styles.advantages}>
              <div className={styles.advantage}>
                <h3 className={styles.itemTitle}>
                  1122{" "}
                  <span className={styles.itemTitleSpan}>городов доставки</span>
                </h3>
                <p className={styles.itemDescription}>
                  Доставляем оборудование по всем городам России
                </p>
              </div>
              <div className={styles.advantage}>
                <h3 className={styles.itemTitle}>
                  {`>100 `}{" "}
                  <span className={styles.itemTitleSpan}>
                    типов оборудования
                  </span>
                </h3>
                <p className={styles.itemDescription}>
                  Вы можете выбрать оборудование для упаковки и фасовки любого
                  типа
                </p>
              </div>
              <div className={styles.advantage}>
                <h3 className={styles.itemTitle}>
                  3750+{" "}
                  <span className={styles.itemTitleSpan}>
                    довольных клиентов
                  </span>
                </h3>
                <p className={styles.itemDescription}>
                  Мы работаем с 2010 года и наши клиенты довольны нашей работой
                </p>
              </div>
              <div className={styles.advantage}>
                <h3 className={styles.itemTitle}>
                  {`>15 `}
                  <span className={styles.itemTitleSpan}>лет опыта</span>
                </h3>
                <p className={styles.itemDescription}>
                  Лет опыта нашей компании
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.ctaWrapper}>
          <div className={styles.textWrapper}>
            <h3 className={styles.ctaTitle}>
              Давайте сотрудничать! <br /> Оставьте заявку на консультацию
            </h3>
            <p className={styles.ctaDescription}>
              Оставьте Ваши контактные данные для связи, чтобы специалист мог
              Вам перезвонить и помочь с подбором оборудования для вашего
              предприятия
            </p>
          </div>

          <AdvantagesBlockCtaButton />
        </div>
      </div>
    </section>
  );
}
