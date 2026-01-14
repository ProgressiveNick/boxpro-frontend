import type { Metadata } from "next";
import { LeadForm } from "@/entities/lead";
import styles from "./Services.module.scss";
import Image from "next/image";
import Link from "next/link";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Услуги BoxPro - обслуживание и ремонт упаковочного оборудования",
  description:
    "Профессиональные услуги по обслуживанию и ремонту упаковочного оборудования любой сложности. Выездная диагностика, компьютерная диагностика, замена расходников, капитальный ремонт.",
  keywords:
    "обслуживание оборудования, ремонт оборудования, диагностика оборудования, замена расходников, капитальный ремонт, наладка оборудования",
  openGraph: {
    title: "Услуги BoxPro - обслуживание и ремонт упаковочного оборудования",
    description:
      "Профессиональные услуги по обслуживанию и ремонту упаковочного оборудования любой сложности.",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function ServicesPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.cover}>
            <h1 className={styles.title}>Услуги</h1>
            <p className={styles.desk}>
              Мы оказываем профессиональные услуги по обслуживанию и ремонту
              любой сложности — гарантируя для наших клиентов беспрерывную
              работу их оборудования, благодаря своевременной поддержке.
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
              <h3 className={styles.factTitle}>Доставка по всей РФ</h3>
              <p className={styles.text}>
                Отправляем оборудование со складов: Москва, Екатеринбург,
                Казань, Новосибирск, Ростов-на-Дону и под заказ в любую точку РФ
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
              <h3 className={styles.factTitle}>Доставка по всей РФ</h3>
              <p className={styles.text}>
                Отправляем оборудование со складов: Москва, Екатеринбург,
                Казань, Новосибирск, Ростов-на-Дону и под заказ в любую точку РФ
              </p>
            </div>
          </div>

          <div className={styles.facts}>
            <Link href={"/services/field-diagnostics"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Выездная диагностика</h3>
                <p className={styles.text}>
                  Проводим ручную диагностику оборудования по всей России
                </p>
              </div>
            </Link>

            <Link href={"/services/computer-analysis"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Компьютерная диагностика</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса предлагают профессиональное
                  обслуживание оборудования из нашего каталога с выездом по всей
                  России
                </p>
              </div>
            </Link>

            <Link href={"/services/manual-diagnostics"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Ручная диагностика</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса оказывают ручную диагностику
                  оборудования из нашего каталога с выездом по всей России
                </p>
              </div>
            </Link>

            <Link href={"/services/replacement"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Замена расходников</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса оказывают услугу замены расходных
                  материалов в оборудовании из нашего каталога с выездом по всей
                  России
                </p>
              </div>
            </Link>

            <Link href={"/services/overhaul"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Капитальный ремонт</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса оказываю профессиональный
                  капитальный ремонт оборудования из нашего каталога с выездом
                  по всей России
                </p>
              </div>
            </Link>

            <Link href={"/services/remont"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Ремонт</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса предлагают комплексный подход к
                  ремонту упаковочного оборудования с выездом по всей России
                </p>
              </div>
            </Link>

            <Link href={"/services/naladka"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Наладка</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса предлагают профессиональную наладку
                  оборудования из нашего каталога с выездом по всей России
                </p>
              </div>
            </Link>

            <Link href={"/services/obsluzhivanie"}>
              <div className={styles.serviceCard}>
                <h3 className={styles.factTitle}>Обслуживание</h3>
                <p className={styles.text}>
                  Специалисты нашего сервиса предлагают профессиональное
                  обслуживание оборудования из нашего каталога с выездом по всей
                  России
                </p>
              </div>
            </Link>
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
