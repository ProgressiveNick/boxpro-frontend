"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput, FormInput, FormTextarea } from "@/shared/ui";
import { leadFormSchema, type LeadFormData, submitLeadForm } from "../model";
import styles from "./LeadForm.module.scss";

type LeadFormProps = {
  headlineText: string;
  deskText: string;
  classes?: string;
  showMessage?: boolean;
};

export function LeadForm({
  headlineText,
  deskText,
  classes,
  showMessage = false,
}: LeadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);

    const result = await submitLeadForm(data);

    if (result.success) {
      reset();
      setIsSuccess(true);
      // Скрываем успешное сообщение через 5 секунд
      setTimeout(() => setIsSuccess(false), 5000);
    } else {
      alert(result.message);
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className={`${classes} ${styles.block} ${styles.success}`}>
        <div className={styles.successMessage}>
          <h2>Заявка успешно отправлена!</h2>
          <p>Менеджер уже спешит связаться с вами!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${classes} ${styles.block}`}>
      <div
        className={styles.title}
        dangerouslySetInnerHTML={{ __html: headlineText }}
      />
      <p className={styles.text}>{deskText}</p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              placeholder="Ваше имя"
              error={errors.name?.message}
              className={styles.input}
            />
          )}
        />

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

        {showMessage && (
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <FormTextarea
                {...field}
                placeholder="Ваше сообщение (необязательно)"
                error={errors.message?.message}
                className={styles.textarea}
              />
            )}
          />
        )}

        <button type="submit" disabled={isSubmitting} className={styles.button}>
          {isSubmitting ? "Отправка..." : "Оставить заявку"}
        </button>
      </form>
    </div>
  );
}
