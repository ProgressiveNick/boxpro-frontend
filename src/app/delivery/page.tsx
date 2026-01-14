import type { Metadata } from "next";
import { LeadForm } from "@/entities/lead";
import styles from "./Delivery.module.scss";
import Image from "next/image";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Доставка упаковочного оборудования BoxPro | По всей России",
  description:
    "Доставка упаковочного оборудования по всей России. Склады в Москве, Екатеринбурге, Казани, Новосибирске, Ростове-на-Дону. От 1500₽ в пределах МКАД.",
  keywords:
    "доставка оборудования, доставка по России, транспортные компании, склады оборудования, стоимость доставки",
  openGraph: {
    title: "Доставка упаковочного оборудования BoxPro | По всей России",
    description:
      "Доставка упаковочного оборудования по всей России. Склады в Москве, Екатеринбурге, Казани, Новосибирске, Ростове-на-Дону.",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function DeliveryPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.cover}>
            <h1 className={styles.title}>Доставка</h1>
            <p className={styles.desk}>
              Мы осуществляем доставку товара по всей России. Стоимость доставки
              зависит от объема груза и предварительно согласовывается с
              поставщиком. Мы отправляем товар любым доступным и оптимально
              выгодным для вас способом
            </p>
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
              <h3 className={styles.factTitle}>Оптимизация маршрутов</h3>
              <p className={styles.text}>
                Рассчитываем оптимальные маршруты доставки, минимизируем время в
                пути и обеспечиваем своевременную доставку грузов
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
              <h3 className={styles.factTitle}>Отслеживание грузов</h3>
              <p className={styles.text}>
                Предоставляем полную информацию о местоположении груза в
                реальном времени и уведомляем о статусе доставки
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
              <h3 className={styles.factTitle}>Специальная упаковка</h3>
              <p className={styles.text}>
                Обеспечиваем надежную упаковку хрупкого оборудования, используем
                защитные материалы и специальные крепления для безопасной
                перевозки
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
              <h3 className={styles.factTitle}>Сборные грузы</h3>
              <p className={styles.text}>
                Организуем сборные перевозки для небольших партий, что позволяет
                снизить стоимость доставки и ускорить отправку
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
              <h3 className={styles.factTitle}>Гибкие тарифы</h3>
              <p className={styles.text}>
                Предлагаем различные варианты доставки: экспресс, стандарт,
                эконом. Стоимость рассчитывается индивидуально под каждый заказ
              </p>
            </div>
          </div>

          <div className={styles.priceCards}>
            <div className={styles.priceCard}>
              <p className={styles.price}>от 1500₽</p>
              <p className={styles.text}>В пределах МКАД</p>
            </div>
            <div className={styles.priceCard}>
              <p className={styles.price}>от 2500₽</p>
              <p className={styles.text}>За пределами МКАД </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Транспортные компании</h2>
            <div className={styles.content}>
              <p className={styles.text}>
                Для перевозки оборудования привлекаются только надежные
                транспортные компании, зарекомендовавшие себя на рынке. Вы
                можете выбрать любого перевозчика на свое усмотрение. При заказе
                на сумму более 50 000 рублей осуществляется бесплатная доставка
                до терминала транспортной компании. Вы всегда можете запросить
                дополнительные услуги при отгрузке, например страхование груза,
                дополнительную упаковку груза и др.
              </p>
            </div>
          </div>

          <div className={styles.facts}>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/с1.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/с2.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/c3.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/c4.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/c5.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/c6.png"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/kit.jpg"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/dimex.webp"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
            <div className={styles.companyLogo}>
              <Image
                src={"/img/delivery/ems.webp"}
                alt={""}
                width={500}
                height={500}
                className={styles.cImage}
              />
            </div>
          </div>

          <LeadForm
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
