"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput, getFullPhoneNumber } from "@/shared/ui/PhoneInput";
import { FormInput } from "@/shared/ui/FormInput";
import { FormTextarea } from "@/shared/ui/FormTextarea";
import { PersonalDataConsent } from "@/features/personal-data-consent";
import {
  consultationFormSchema,
  type ConsultationFormData,
  submitConsultationForm,
} from "@/entities/consultation-form";
import styles from "./ConsultationForm.module.scss";

type ConsultationFormProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
};

export function ConsultationForm({
  isOpen,
  onClose,
  title = "Получить консультацию",
  description = "Оставьте заявку и наши специалисты помогут подобрать оборудование под ваш продукт",
  buttonText = "Оставить заявку",
}: ConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      personalDataConsent: false,
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);

    try {
      // Форматируем номер телефона для отправки
      const formData = {
        ...data,
        phone: getFullPhoneNumber(data.phone),
      };

      const result = await submitConsultationForm(formData);

      if (result.success) {
        setIsSuccess(true);
        reset();
        // Закрываем форму через 3 секунды
        setTimeout(() => {
          onClose();
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
      <div className={styles.overlay} onClick={onClose}>
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
            <button className={styles.closeButton} onClick={onClose}>
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headWrapper}>
          <div className={styles.headContent}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
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
              name="name"
              control={control}
              render={({ field }) => (
                <FormInput
                  {...field}
                  type="text"
                  placeholder="Ваше имя"
                  error={errors.name?.message}
                  className={styles.input}
                />
              )}
            />
          </div>

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

          <div className={styles.inputGroup}>
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <FormTextarea
                  {...field}
                  placeholder="Ваше сообщение (необязательно)"
                  className={styles.textarea}
                  rows={3}
                />
              )}
            />
          </div>

          <div className={styles.inputGroup}>
            <Controller
              name="personalDataConsent"
              control={control}
              render={({ field }) => (
                <PersonalDataConsent
                  checked={field.value}
                  onChange={field.onChange}
                  error={errors.personalDataConsent?.message}
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
            {isSubmitting ? "Отправка..." : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
}
