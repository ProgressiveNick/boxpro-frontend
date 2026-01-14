import type { Metadata } from "next";
import styles from "./GarantRemont.module.scss";
import Link from "next/link";
import Image from "next/image";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Гарантия и ремонт упаковочного оборудования BoxPro | Техподдержка",
  description:
    "Официальная гарантийная и послегарантийная техподдержка на все оборудование Hualian. Собственный сервисный центр, диагностика, ремонт, модернизация оборудования.",
  keywords:
    "гарантия оборудования, ремонт оборудования, техподдержка, сервисный центр, постгарантийное обслуживание, рекламация",
  openGraph: {
    title: "Гарантия и ремонт упаковочного оборудования BoxPro",
    description:
      "Официальная гарантийная и послегарантийная техподдержка на все оборудование Hualian. Собственный сервисный центр.",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function WarrantyAndRepairPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.cover}>
            <h1 className={styles.title}>Гарантия и ремонт</h1>
            <p className={styles.desk}>
              Мы предоставляем каждому покупателю официальную гарантийную и
              послегарантийную техподдержку на все оборудование Hualian.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Постгарантийное обслуживание</h2>
            <div className={styles.content}>
              <p className={styles.text}>
                Срок гарантии варьируется в зависимости от его конкретной
                модификации и указывается в паспорте оборудования.
              </p>
              <p className={styles.text}>
                После истечения гарантийного срока специалисты компании
                продолжают оказывать комплексную поддержку на всех этапах
                эксплуатации оборудования.
              </p>
              <p className={styles.text}>
                Наличие собственного сервисного центра и обширного склада
                запчастей во всех филиалах компании позволяет оперативно
                выполнять все виды диагностики, ремонта, модернизации и
                настройки оборудования.
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Направление рекламации</h2>
            <div className={styles.content}>
              <p className={styles.text}>
                Направление рекламации Все претензии по качеству товара в
                гарантийный период предъявляются в письменном виде путем подачи
                рекламации. Претензия подается на фирменном бланке компании.
              </p>
              <div className={styles.links}>
                <Link className={` ${styles.text} ${styles.link}`} href="/">
                  {" "}
                  Акт рекламации
                </Link>
                <Link className={` ${styles.text} ${styles.link}`} href="/">
                  Акт о проведении срвисных работ{" "}
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Ремонт оборудования</h2>
            <div className={styles.content}>
              <Image
                src="/img/garant/remont.jpg"
                width={600}
                height={300}
                className={styles.image}
                alt="Picture of the author"
              />
              <p className={styles.text}>
                Заявки на ремонт оборудования, вышедшего из строя по истечению
                гарантийного срока эксплуатации, принимаются в порядке,
                аналогичном для оборудования, находящегося на гарантии.
              </p>
              <p className={styles.text}>
                Специалист сервисного центра направит вам письмо в течении 24
                часов в рабочий день и предоставит информацию о предварительной
                стоимости и сроках выполнения ремонтных работ.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
