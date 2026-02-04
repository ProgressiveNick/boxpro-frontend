import type { Metadata } from "next";
import { CtaForm } from "@/widgets/client-widgets";
import { ContactsBlock } from "@/widgets/server-widgets";
import styles from "./Lizing.module.scss";
import Image from "next/image";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title:
    "Лизинг упаковочного оборудования BoxPro | Выгодные условия финансирования",
  description:
    "Приобретайте упаковочное оборудование в лизинг на выгодных условиях. Сотрудничество с Элемент Лизинг и ARENZA. Финансирование от 100,000 до 15,000,000 рублей.",
  keywords:
    "лизинг оборудования, финансирование оборудования, Элемент Лизинг, ARENZA, покупка в рассрочку, лизинговые компании",
  openGraph: {
    title:
      "Лизинг упаковочного оборудования BoxPro | Выгодные условия финансирования",
    description:
      "Приобретайте упаковочное оборудование в лизинг на выгодных условиях. Сотрудничество с Элемент Лизинг и ARENZA.",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function LeasingPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <CtaForm
            headlineText={`<h2>Приобретайте оборудование сегодня!<br /> Благодаря выгодным условиям лизинга</h2>`}
            deskText={`Оставьте Ваши контактные данные для связи, чтобы специалист мог
                Вам перезвонить и помочь с подбором оборудования и оформления лизинга`}
            classes={styles.cover}
          />

          <div className={styles.block}>
            <h2 className={styles.title}>Элемент Лизинг</h2>
            <div className={styles.content}>
              <Image
                src="/img/lizing/element.jpg"
                width={800}
                height={300}
                className={styles.image}
                alt="Picture of the author"
              />
              <p className={styles.text}>
                «Элемент Лизинг» - современная динамичная финансовая компания,
                один из лидеров лизингового рынка России в сегменте небольших
                лизинговых контрактов. Работает с 2004 года, входит в ТОП-20
                лизинговых компаний рэнкинга Эксперт РА, имеет надежную
                репутацию и опыт.
              </p>
              <p className={styles.text}>
                Широкая региональная сеть по всей России, взаимодействие с
                ведущими поставщиками и гибкие условия финансирования позволяют
                им занимать прочные позиции в целевых сегментах.
              </p>
            </div>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>Элемент Лизинг</h2>
            <div className={styles.content}>
              <Image
                src="/img/lizing/arenza.jpg"
                width={800}
                height={300}
                className={styles.image}
                alt="Picture of the author"
              />
              <p className={styles.text}>
                ARENZA – первая в России лизинговая компания онлайн для малого
                бизнеса с фокусом на сделках по покупке оборудования от 100,000
                до 15,000,000 рублей. В партнерстве с продавцами оборудования мы
                помогаем индивидуальным предпринимателям и малому бизнесу
                получить необходимое оборудование в самый короткий срок. ARENZA
                разрабатывает взаимовыгодные финансовые решения, помогающие
                продавцам продать оборудование в рассрочку, а покупателям
                зарабатывать и рассчитываться комфортными ежемесячными
                платежами.
              </p>
            </div>
          </div>

          <ContactsBlock />
        </div>
      </section>
    </>
  );
}
