import type { Metadata } from "next";
import { CtaForm } from "@/widgets/client-widgets";
import styles from "./Requisites.module.scss";

// ISR: ревалидация каждые 24 часа (86400 секунд)
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Реквизиты и оплата BoxPro | ООО БОКСПРО",
  description:
    "Реквизиты ООО «БОКСПРО» для оплаты упаковочного оборудования. ИНН: 9710149890, банк: АО «ТБанк». Отгрузка в течение 3 дней после оплаты.",
  keywords:
    "реквизиты BoxPro, ООО БОКСПРО, оплата оборудования, банковские реквизиты, ИНН, расчетный счет",
  openGraph: {
    title: "Реквизиты и оплата BoxPro | ООО БОКСПРО",
    description:
      "Реквизиты ООО «БОКСПРО» для оплаты упаковочного оборудования. ИНН: 9710149890, банк: АО «ТБанк».",
    type: "website",
    locale: "ru_RU",
  },
};

export default async function RequisitesPage() {
  return (
    <>
      <section className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.cover}>
            <h1 className={styles.title}>Реквизиты и оплата</h1>
            <p className={styles.desk}>
              Оплата оборудования производится на основании счета,
              преимущественно по безналу. Ввиду постоянного наличия большинства
              предлагаемых устройств на складе, отгрузка осуществляется в
              течение трех дней после перечисления денежных средств.
            </p>
          </div>

          <div className={styles.block}>
            <h2 className={styles.title}>НАШИ РЕКВИЗИТЫ</h2>
            <div className={styles.content}>
              <div className={styles.reqRow}>
                <p className={styles.reqName}>Название организации</p>
                <p className={styles.reqValue}>ООО «БОКСПРО»</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>ИНН</p>
                <p className={styles.reqValue}>9710149890</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>КПП</p>
                <p className={styles.reqValue}>771001001</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>ОГРН</p>
                <p className={styles.reqValue}>1257700249146</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>БАНК</p>
                <p className={styles.reqValue}>Банк: АО «ТБанк»</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>Р/С</p>
                <p className={styles.reqValue}>40702810610001919081</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>К/C</p>
                <p className={styles.reqValue}>30101810145250000974</p>
              </div>

              <div className={styles.reqRow}>
                <p className={styles.reqName}>БИК</p>
                <p className={styles.reqValue}>044525974</p>
              </div>
            </div>
          </div>

          {/* <div className={styles.block}>
            <h2 className={styles.title}>КЛИЕНТАМ ПРОМСВЯЗЬБАНКА</h2>
            <div className={styles.content}>
              <Image
                src="/img/requizites/prombank.jpg"
                width={600}
                height={220}
                className={styles.image}
                alt="Picture of the author"
              />
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
          </div> */}

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
