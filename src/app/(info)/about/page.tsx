import type { Metadata } from "next";
import { CtaForm } from "@/widgets/client-widgets";
import styles from "./About.module.scss";
import Image from "next/image";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "О компании BoxPro - упаковочное оборудование ",
  description:
    "BoxPro - №1 в поставке упаковочных машин в РФ. Более 19 лет опыта, 1000+ городов обслуживания, 4216 довольных клиентов. Профессиональное обслуживание и ремонт оборудования.",
  keywords:
    "BoxPro, упаковочные машины, поставка оборудования, обслуживание оборудования, ремонт оборудования, опыт работы",
  openGraph: {
    title: "О компании BoxPro - упаковочное оборудование",
    description:
      "BoxPro - №1 в поставке упаковочных машин в РФ. Более 19 лет опыта, 1000+ городов обслуживания.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.cover}>
            <h1 className={styles.title}>О компании</h1>
          </div>

          <div className={styles.aboutBlock}>
            <div className={styles.aboutBlockLeft}>
              <h2 className={styles.title}>
                BoxPro — №1 В поставке Упаковачных Машин в РФ
              </h2>
              <p className={styles.text}>
                Мы - Команда профессионалов, работающих с широким спектром
                оборудования, расходных и запасных частей , а также полного
                цикла обслуживания и ремонта. Многолетний опыт в отрасли дает
                позволяет решать сложнейшие задачи в короткие сроки, за что нас
                и ценят клиенты по всей России. <br />
                Знаем рынок, технические особенности продаваемых продуктов,
                оперативно выполняем работу, предоставляем нашим партнерам самое
                высокое качество обслуживания.
              </p>
            </div>

            <div className={styles.content}>
              <Image
                src="/img/about/logoCard.svg"
                width={480}
                height={230}
                className={styles.aboutImage}
                alt="Picture of the author"
              />
            </div>
          </div>

          <div className={styles.priceCards}>
            <div className={styles.priceCard}>
              <p className={styles.price}>1122</p>
              <p className={styles.text}>Городов доставки</p>
            </div>
            <div className={styles.priceCard}>
              <p className={styles.price}>{">"}100</p>
              <p className={styles.text}>Типов оборудования </p>
            </div>
            <div className={styles.priceCard}>
              <p className={styles.price}>{">"}15</p>
              <p className={styles.text}>Лет опыта</p>
            </div>
            <div className={styles.priceCard}>
              <p className={styles.price}>3750+</p>
              <p className={styles.text}>Довольных клиентов</p>
            </div>
          </div>

          <div className={styles.facts}>
            <div className={styles.fact}>
              <Image
                src={"/img/delivery/one.png"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Доставка по всей РФ</h3>
              <p className={styles.text}>
                Отправляем оборудование со складов: Москва, Екатеринбург,
                Казань, Новосибирск, Ростов-на-Дону и под заказ в любую точку РФ
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/two.png"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Сервисное обслуживание</h3>
              <p className={styles.text}>
                Обеспечиваем полный цикл технического обслуживания, диагностику
                оборудования и оперативный ремонт на территории заказчика
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/three.webp"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Консультации экспертов</h3>
              <p className={styles.text}>
                Предоставляем профессиональные консультации по подбору
                оборудования, технические решения и поддержку на всех этапах
                проекта
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/four.png"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Запасные части</h3>
              <p className={styles.text}>
                Поставляем оригинальные запасные части и расходные материалы для
                всего спектра упаковочного и производственного оборудования
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/five.png"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Автоматизация производства</h3>
              <p className={styles.text}>
                Внедряем современные системы автоматизации, конвейерные линии и
                роботизированные решения для повышения эффективности
                производства
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/six.png"}
                alt={""}
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Выгодные условия</h3>
              <p className={styles.text}>
                Предлагаем конкурентные цены, гибкие условия оплаты, скидки для
                постоянных клиентов и специальные предложения на объемные заказы
              </p>
            </div>
          </div>

          <CtaForm
            headlineText={`<h2>Давайте сотрудничать! <br />
        Оставьте заявку на консультацию</h2>`}
            deskText={`Оставьте Ваши контактные данные для связи, чтобы специалист мог
        Вам перезвонить и помочь с подбором оборудования для вашего
        предприятия`}
          />
        </div>
      </section>
    </>
  );
}
