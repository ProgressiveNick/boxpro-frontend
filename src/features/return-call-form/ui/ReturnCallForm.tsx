"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useReturnCallFormStore } from "@/widgets/return-call-form/model/store";
import { PhoneInput, getFullPhoneNumber } from "@/shared/ui/PhoneInput";
import {
  returnCallFormSchema,
  type ReturnCallFormData,
  submitReturnCallForm,
} from "@/entities/return-call-form";
import styles from "./ReturnCallForm.module.scss";

export function ReturnCallForm() {
  const { isOpen, closeForm } = useReturnCallFormStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReturnCallFormData>({
    resolver: zodResolver(returnCallFormSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (data: ReturnCallFormData) => {
    setIsSubmitting(true);

    try {
      // Форматируем номер телефона для отправки
      const formData = {
        ...data,
        phone: getFullPhoneNumber(data.phone),
      };

      const result = await submitReturnCallForm(formData);

      if (result.success) {
        setIsSuccess(true);
        reset();
        // Закрываем форму через 3 секунды
        setTimeout(() => {
          closeForm();
          setIsSuccess(false);
        }, 3000);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Ошибка отправки формы:", error);
      alert("Произошла ошибка при отправке заявки. Попробуйте еще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Показываем состояние успеха
  if (isSuccess) {
    return (
      <div className={styles.overlay} onClick={closeForm}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.successContent}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 11 3 3L22 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Мы получили вашу заявку!</h2>
            <p className={styles.successMessage}>
              Менеджер свяжется с вами в течение 5-ти минут
            </p>
            <button className={styles.closeButton} onClick={closeForm}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={closeForm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headWrapper}>
          <div className={styles.headContent}>
            <h2 className={styles.title}>Обратный звонок</h2>
            <p className={styles.description}>
              Оставьте свой номер телефона, и мы свяжемся с вами в ближайшее
              время
            </p>
          </div>
          <button className={styles.closeButton} onClick={closeForm}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  className={styles.input}
                />
              )}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`${styles.submitButton} ${
              isSubmitting ? styles.loading : ""
            }`}
          >
            {isSubmitting ? "Отправка..." : "Заказать звонок"}
          </button>
        </form>
        <p className={styles.privacy}>
          Нажимая на кнопку &quot;Заказать звонок&quot;, я соглашаюсь с{" "}
          <a href="https://docs.google.com/document/d/1OoHa-_O0RZ3eyH379jL3sYSTGRwd1LWE2F2IKxgJ-bw/edit?usp=sharing">
            <span>Политикой конфиденциальности</span>
          </a>
        </p>
      </div>
    </div>
  );
}
