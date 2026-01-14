"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTestFormStore } from "@/widgets/test-form/model/store";
import { PhoneInput, getFullPhoneNumber } from "@/shared/ui/PhoneInput";
import { FileUpload } from "@/shared/ui/FileUpload";
import { FormInput } from "@/shared/ui/FormInput/index";
import {
  testFormSchema,
  type TestFormData,
  submitTestForm,
} from "@/entities/test-form";
import styles from "./TestForm.module.scss";
import ym from "react-yandex-metrika";

type TestFormProps = {
  title?: string;
  description?: string;
  buttonText?: string;
};

export function TestForm({
  title = "Бесплатно протестируем упаковочное оборудование на ваших образцах",
  description = "Оставьте заявку и мы договоримся обо всех условиях: подготовим оборудование, запросим образцы и протестируем - результат увидите очно или в формате фото\\видеозаписи",
  buttonText = "Получить консультацию\\КП",
}: TestFormProps) {
  const { isOpen, closeForm } = useTestFormStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showFileUpload, setShowFileUpload] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      files: [],
    },
  });

  // Сбрасываем состояние загрузки файлов при закрытии формы
  React.useEffect(() => {
    if (!isOpen) {
      setShowFileUpload(false);
      reset();
      setIsSuccess(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: TestFormData) => {
    setIsSubmitting(true);

    try {
      // Форматируем номер телефона для отправки
      const formData = {
        ...data,
        phone: getFullPhoneNumber(data.phone),
      };

      const result = await submitTestForm(formData);

      if (result.success) {
        ym("reachGoal", "test_form_submit");

        setIsSuccess(true);
        reset();
        setShowFileUpload(false);
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
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
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

          {showFileUpload && (
            <div className={styles.fileUploadGroup}>
              <Controller
                name="files"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    files={field.value || []}
                    onChange={(files) => field.onChange(files)}
                    className={styles.fileUpload}
                  />
                )}
              />
            </div>
          )}

          {!showFileUpload && (
            <button
              type="button"
              onClick={() => setShowFileUpload(true)}
              className={styles.attachButton}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.attachIcon}
              >
                <path
                  d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Прикрепить файлы
            </button>
          )}

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
        <p className={styles.privacy}>
          Нажимая на кнопку &quot;{buttonText}&quot;, я соглашаюсь с{" "}
          <a href="https://docs.google.com/document/d/1OoHa-_O0RZ3eyH379jL3sYSTGRwd1LWE2F2IKxgJ-bw/edit?usp=sharing">
            <span>Политикой конфиденциальности</span>
          </a>
        </p>
      </div>
    </div>
  );
}
