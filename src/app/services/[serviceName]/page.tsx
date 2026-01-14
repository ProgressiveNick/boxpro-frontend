import Image from "next/image";
import type { Metadata } from "next";

import styles from "./Service.module.scss";
import Link from "next/link";

import { Breadcrumbs } from "@/widgets/client-widgets";
import { ContactsBlock } from "@/widgets/server-widgets";
import PATH_TITLES from "@/shared/lib/path-titles";
import { LeadForm } from "@/entities/lead";
import { generateSEO, generateServiceSEO } from "@/shared/lib/seo-utils";

type Params = Promise<{ serviceName: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { serviceName } = await params;

  const serviceKey = Array.isArray(serviceName) ? serviceName[0] : serviceName;
  const titles: Record<string, string> = PATH_TITLES as Record<string, string>;
  const serviceTitle = titles[serviceKey] || serviceKey.replace(/-/g, " ");

  return generateSEO(generateServiceSEO(serviceTitle));
}

export default async function ServicePage(props: { params: Params }) {
  const params = await props.params;
  const serviceName = params.serviceName;

  const serviceKey =
    (Array.isArray(serviceName) ? serviceName[0] : serviceName) || "";
  const titles: Record<string, string> = PATH_TITLES as Record<string, string>;

  return (
    <>
      <Breadcrumbs />
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <LeadForm
            headlineText={`<h2>${
              titles[serviceKey] || serviceKey.replace(/-/g, " ")
            } <br /> упаковочного оборудования</h2>`}
            deskText={`Проводим ${
              titles[serviceKey] || serviceKey.replace(/-/g, " ")
            }   оборудования по всей России`}
            classes={styles.cover}
          />

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

          <div className={styles.block}>
            <h2 className={styles.title}>Схема работы</h2>
            <div className={` ${styles.stepsJob}`}>
              <div className={styles.stepCard}>
                <span className={styles.stepNumber}>1</span>
                <h3 className={styles.nameStep}>Оставьте заявку</h3>
                <p className={styles.text}>
                  Вы можете оставить заявку заполнив форму на сайте или
                  позвонить в наш сервисный центр{" "}
                  <Link href="tel:+79265198808">8 (926) 519-88-08</Link>
                </p>
              </div>
              <div className={styles.stepCard}>
                <span className={styles.stepNumber}>2</span>
                <h3 className={styles.nameStep}>Дата и время</h3>
                <p className={styles.text}>
                  Менеджер перезвонит вам в течении 30 минут для согласования
                  даты и времени, когда специалисту необходимо приехать
                </p>
              </div>
              <div className={styles.stepCard}>
                <span className={styles.stepNumber}>3</span>
                <h3 className={styles.nameStep}>Диагностика и ремонт</h3>
                <p className={styles.text}>
                  Менеджер перезвонит вам в течении 30 минут для согласования
                  даты и времени, когда специалисту необходимо приехать
                </p>
              </div>
              <div className={styles.stepCard}>
                <span className={styles.stepNumber}>4</span>
                <h3 className={styles.nameStep}>Оплата и постобслуживание</h3>
                <p className={styles.text}>
                  Менеджер перезвонит вам в течении 30 минут для согласования
                  даты и времени, когда специалисту необходимо приехать
                </p>
              </div>
            </div>
          </div>

          <ContactsBlock />
        </div>
      </section>
    </>
  );
}
