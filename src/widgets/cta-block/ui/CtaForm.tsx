"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./CtaForm.module.scss";
import { handleFormSubmission } from "@/shared/lib/HandleFormSubmission";

export function CtaForm({
  headlineText,
  deskText,
  classes,
}: {
  headlineText: string;
  deskText: string;
  classes?: string;
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Останавливаем стандартное поведение формы
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const response = await handleFormSubmission(formData);

        if (response.success) {
          event.currentTarget.reset();
          router.push("/thankyou");
        } else {
          setErrorMessage("Что-то пошло не так. Повторите попытку.");
        }
      } catch (error) {
        console.error("Ошибка отправки формы:", error);
        setErrorMessage("Ошибка при отправке формы.");
      }
    });
  };

  return (
    <div className={`${classes} ${styles.block}`}>
      <div
        className={styles.title}
        dangerouslySetInnerHTML={{ __html: headlineText }}
      ></div>
      <p className={styles.text}>{deskText}</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Ваше имя"
          required
          className={styles.input}
        />

        <input
          type="tel"
          name="phone"
          placeholder="+7 (999) 999-99-99"
          required
          className={styles.input}
        />

        <button type="submit" disabled={isPending} className={styles.button}>
          {isPending ? "Отправка..." : "Оставить заявку"}
        </button>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </form>
    </div>
  );
}
