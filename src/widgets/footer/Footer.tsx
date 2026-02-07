"use client";

import FullLogo from "@/shared/ui/logo/FullLogo";
import Link from "next/link";
import FooterNavBlock from "./footer-nav-block/FooterNavBlock";

export function Footer() {
  const blockData = [
    {
      title: "Обработка и производство",
      items: [
        {
          label: "Пищевое оборудование",
          link: "/catalog/pischevoe-oborudovanie",
        },

        { label: "Оборудование HORECA", link: "/catalog/oborudovanie-horeca" },
        {
          label: "Мясопереработка",
          link: "/catalog/myasopererabatyvayuschee-oborudovanie",
        },
      ],
    },
    {
      title: "Фасовка",
      items: [
        {
          label: "Для гранулированной и сыпучей продукции",
          link: "catalog/fasovochno-upakovochnoe-oborudovanie/dozatory-sypuchih-trudnosypuchih-produktov",
        },
        {
          label: "Для жидкой продукции",
          link: "/catalog/fasovochno-upakovochnoe-oborudovanie/dozatory-dlya-zhidkosti-porshnevye",
        },
      ],
    },
    {
      title: "Упаковка",
      items: [
        {
          label: "Горизонтальные машины",
          link: "/catalog/upakovochnoe-oborudovanie/gorizontal-nye-upakovochnye-mashiny",
        },
        {
          label: "Термоусадочное оборудование",
          link: "/catalog/termousadochnye-apparaty",
        },
        {
          label: "Вакуумное оборудование",
          link: "/catalog/vakuumnye-upakovschiki",
        },
        {
          label: "Паллетоупаковщики",
          link: "/catalog/palletoupakovschiki-palletoobmotchiki",
        },
        {
          label: "Запайщики лотков",
          link: "/catalog/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie/zapayschiki-lotkov",
        },
        {
          label: "Термоформеры",
          link: "/catalog/zapayschiki-lotkov-skin-mashiny-termoformovochnoe-oborudovanie/termoformery",
        },
      ],
    },
    {
      title: "Услуги",
      items: [
        {
          label: "Замена рассходных материалов",
          link: "/services/replacement",
        },
        { label: "Ремонт оборудования", link: "/services/remont" },
        { label: "Диагностика", link: "/services/manual-diagnostics" },
      ],
    },
    {
      title: "Покупателю",
      items: [
        { label: "Доставка", link: "/delivery" },
        { label: "Гарантии", link: "/garant-and-remont" },
        { label: "Возврат", link: "/return" },
        { label: "Лизинг", link: "/lizing" },
      ],
    },
    {
      title: "Компания",
      items: [
        { label: "О компании", link: "/about" },
        { label: "Реквизиты", link: "/requisites" },
        { label: "Контакты", link: "/contacts" },
      ],
    },
  ];

  return (
    <footer>
      <div className="container-footer">
        <div className="footer-head-container">
          <FullLogo />
          <div className="footer-contact-container">
            <p className="job-time">Отдел по работе с клиентами</p>
            <Link className="footer-contact-number" href="tel:+78004444753">
              <p>8(800)444-47-53</p>
            </Link>
          </div>

          <div className="footer-contact-container">
            <p className="job-time">
              Почта для вопросов и коммерческих запросов
            </p>
            <Link
              className="footer-contact-number"
              href="mailto:mail@boxpro.moscow"
            >
              <p>mail@boxpro.moscow</p>
            </Link>
          </div>
        </div>

        <div className="footer-navs-container">
          {blockData.map((block, index) => (
            <FooterNavBlock
              key={index}
              title={block.title}
              items={block.items}
            />
          ))}
        </div>

        <div className="footer-bottom-container">
          <div className="footer-bottom-left">
            <p>ОГРН 1257700249146 , ИНН 9710149890 , КПП 771001001</p>
            <p>
              109012, Россия, г. Москва, вн.тер.г. муниципальный округ Тверской,
              пл. Новая, д. 8, стр. 2, помещ. ¼
            </p>
          </div>
          <div className="footer-bottom-right">
            <div className="footer-pay-method-container pay-nal">
              <p> Оплата наличными</p>
            </div>
            <div className="footer-pay-method-container pay-rs">
              <p> Оплата по Р\C</p>
            </div>
            <div className="footer-pay-method-container pay-card">
              <p> Оплата картой </p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-footer down-footer">
        <a href="https://docs.google.com/document/d/1OoHa-_O0RZ3eyH379jL3sYSTGRwd1LWE2F2IKxgJ-bw/edit?usp=sharing">
          <p> Политика конфиденциальности</p>
        </a>

        <p>2019-2025 Все права защищены ООО &quot;БОКСПРО&quot; ©</p>
        <Link href="/">
          <p>
            {" "}
            Design by <span className="progressive-lable">Progressive</span>
          </p>
        </Link>
      </div>
    </footer>
  );
}
