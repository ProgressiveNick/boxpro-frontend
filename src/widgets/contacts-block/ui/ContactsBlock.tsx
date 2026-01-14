import React from "react";
import styles from "./ContactsBlock.module.scss";
import Link from "next/link";
import { contactCards, contactsData } from "../model/data";

export function ContactsBlock() {
  const getCardClassName = (type: string) => {
    switch (type) {
      case "phone":
        return styles.phone;
      case "mail":
        return styles.mail;
      case "address":
        return styles.adress;
      case "time":
        return styles.timejob;
      default:
        return "";
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headline}>
          <h1 className={styles.title}>{contactsData.title}</h1>
          <p className={styles.desk}>{contactsData.description}</p>
        </div>

        {contactCards.map((card) => {
          let content;
          if (card.href) {
            content = (
              <Link href={card.href} className={styles.value}>
                {card.value}
              </Link>
            );
          } else if (card.type === "time") {
            content = <p className={styles.valueSecond}>{card.value}</p>;
          } else {
            content = card.value;
          }

          return (
            <div
              key={card.type}
              className={`${styles.contactBlock} ${getCardClassName(
                card.type
              )}`}
            >
              <p className={styles.label}>{card.label}</p>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
