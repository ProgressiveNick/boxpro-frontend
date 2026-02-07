import Image from "next/image";
import type { Metadata } from "next";

import styles from "./Service.module.scss";
import Link from "next/link";

import { Breadcrumbs } from "@/widgets/client-widgets";
import { ContactsBlock } from "@/widgets/server-widgets";
import PATH_TITLES from "@/shared/lib/path-titles";
import { LeadForm } from "@/entities/lead";
import { generateSEO, generateServiceSEO } from "@/shared/lib/seo-utils";
import {
  getServiceDescription,
  SERVICE_PHONE,
  SERVICE_PHONE_HREF,
  WORK_STEPS,
} from "@/shared/lib/service-content";

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
  const serviceDescription = getServiceDescription(serviceKey);

  const descriptionData = serviceDescription ?? {
    title: titles[serviceKey] || "Услуга",
    image: "/img/garant/remont.jpg",
    paragraphs: [
      "Специалисты нашего сервиса оказывают профессиональные услуги по обслуживанию и ремонту упаковочного оборудования с выездом по всей России. Оставьте заявку для расчёта стоимости и согласования сроков.",
    ],
  };

  return (
    <>
      <div className={styles.breadcrumbsWrapper}>
        <Breadcrumbs />
      </div>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <LeadForm
            headlineText={`<h2>${
              titles[serviceKey] || serviceKey.replace(/-/g, " ")
            } <br /> упаковочного оборудования</h2>`}
            deskText={`Проводим ${
              titles[serviceKey] || serviceKey.replace(/-/g, " ")
            } оборудования по всей России`}
            classes={styles.cover}
          />

          <div className={styles.facts}>
            <div className={styles.fact}>
              <Image
                src={"/img/delivery/one.png"}
                alt="Выезд по всей России"
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Выезд по всей России</h3>
              <p className={styles.text}>
                Наши специалисты выезжают для диагностики, ремонта и
                обслуживания упаковочного оборудования в любой регион России
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/two.png"}
                alt="Оригинальные запчасти"
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Оригинальные запчасти</h3>
              <p className={styles.text}>
                Используем только оригинальные комплектующие и расходные
                материалы для гарантии долговечности и надёжности оборудования
              </p>
            </div>

            <div className={styles.fact}>
              <Image
                src={"/img/delivery/three.webp"}
                alt="Гарантия на работы"
                width={96}
                height={96}
                className={styles.image}
              />
              <h3 className={styles.factTitle}>Гарантия на работы</h3>
              <p className={styles.text}>
                Предоставляем гарантию на все виды выполненных работ — вы можете
                быть уверены в качестве наших услуг
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>{descriptionData.title}</h2>
            <div className={styles.content}>
              <Image
                src={descriptionData.image}
                width={600}
                height={300}
                className={styles.image}
                alt={descriptionData.title}
              />
              {descriptionData.paragraphs.map((paragraph, index) => (
                <p key={index} className={styles.text}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Схема работы</h2>
            <div className={` ${styles.stepsJob}`}>
              {WORK_STEPS.map((step) => (
                <div key={step.number} className={styles.stepCard}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <h3 className={styles.nameStep}>{step.title}</h3>
                  <p className={styles.text}>
                    {step.number === 1 ? (
                      <>
                        {step.text}{" "}
                        <Link href={SERVICE_PHONE_HREF}>{SERVICE_PHONE}</Link>
                      </>
                    ) : (
                      step.text
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ContactsBlock />
        </div>
      </section>
    </>
  );
}
