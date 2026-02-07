import { FC, useState } from "react";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderFormData, PaymentMethod } from "@/entities/order/model/types";
import {
  orderFormSchema,
  OrderFormSchema,
} from "@/entities/order/model/schema";
import { orderApi } from "@/entities/order/api/orderApi";
import { useCartStore } from "@/entities/cart/model/store";
import { cookieStorage } from "@/shared/lib/cookieStorage";
import { FormInput, PhoneInput, getFullPhoneNumber } from "@/shared/ui";
import { FileUpload } from "@/shared/ui/FileUpload";
import { PersonalDataConsent } from "@/features/personal-data-consent";
import Dropdown from "@/shared/ui/Dropdown/Dropdown";
import styles from "./OrderForm.module.scss";
import ym from "react-yandex-metrika";

type OrderFormProps = {
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
  onSuccess?: () => void;
  isOpen?: boolean;
  orderId?: string;
};

export const OrderForm: FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  onSuccess,
  isOpen = true,
  orderId,
}) => {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<OrderFormSchema>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      paymentMethod: undefined,
      files: [],
      personalDataConsent: false,
      order: orderId
        ? [] // Если orderId передан, товары уже в заказе
        : items.map((item) => ({
            name: item.title,
            documentId: item.id,
            count: item.quantity,
            sum: item.price * item.quantity,
          })),
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

  const onSubmitHandler = async (data: OrderFormSchema) => {
    setIsSubmitting(true);
    try {
      const orderData: OrderFormData = {
        fullName: data.fullName,
        phone: getFullPhoneNumber(data.phone),
        paymentMethod: data.paymentMethod as PaymentMethod | undefined,
        files: data.files ?? [],
        order: data.order ?? [],
      };

      if (orderId) {
        // Обновляем существующий заказ
        const formData = new FormData();
        formData.append("fullName", orderData.fullName);
        formData.append("phone", orderData.phone);
        if (orderData.paymentMethod) {
          formData.append("paymentMethod", orderData.paymentMethod);
        }
        if (orderData.files && orderData.files.length > 0) {
          orderData.files.forEach((file) => {
            formData.append("files", file);
          });
        }

        const response = await fetch(`/api/order/${orderId}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ошибка оформления заказа");
        }

        const result = await response.json();

        if (result.success) {
          // Очищаем корзину
          clearCart();

          // Очищаем documentId заказа из store и куки
          useCartStore.getState().setCurrentOrderDocumentId(null);
          cookieStorage.removeItem("current-order-document-id");

          setIsSuccess(true);
          setShowFileUpload(false);
          reset();

          ym("reachGoal", "order_form_submit", {
            order_id: orderId,
            order_date: new Date().toISOString(),
            order_status: "processing",
            order_payment_method: orderData.paymentMethod,
          });

          // Вызываем callback успеха
          setTimeout(() => {
            onSuccess?.();
            onSubmit(orderData);
          }, 2000);
        }
      } else {
        // Старый способ - создание нового заказа (для обратной совместимости)
        const currentItems = useCartStore.getState().items;
        orderData.order = currentItems.map((item) => ({
          name: item.title,
          documentId: item.id,
          count: item.quantity,
          sum: item.price * item.quantity,
        }));

        const response = await orderApi.submitOrder(orderData);

        if (response.success) {
          clearCart();

          // Очищаем documentId заказа из store и куки
          useCartStore.getState().setCurrentOrderDocumentId(null);
          cookieStorage.removeItem("current-order-document-id");

          setIsSuccess(true);
          setShowFileUpload(false);
          reset();

          ym("reachGoal", "order_form_submit", {
            order_id: orderData.order.map((item) => item.documentId),
            order_sum: orderData.order.reduce((acc, item) => acc + item.sum, 0),
            order_date: new Date().toISOString(),
            order_status: "pending",
            order_payment_method: orderData.paymentMethod,
          });

          setTimeout(() => {
            onSuccess?.();
            onSubmit(orderData);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Ошибка отправки заказа:", error);
      setIsSubmitting(false);

      setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : "Ошибка отправки заказа",
      });
    }
  };

  const paymentOptions = [
    { value: PaymentMethod.CASH, label: "Наличные" },
    { value: PaymentMethod.CARD, label: "Банковская карта" },
    { value: PaymentMethod.BANK_TRANSFER, label: "Банковский перевод" },
    { value: PaymentMethod.REQUISITE, label: "С расчетного счета компании" },
    { value: PaymentMethod.CREDIT, label: "Кредит" },
    { value: PaymentMethod.LIZING, label: "Лизинг" },
  ];

  // Преобразуем опции для Dropdown
  const dropdownOptions = paymentOptions.map((option) => option.label);

  if (isSuccess) {
    return (
      <div className={styles.successContent}>
        <div className={styles.successIcon}>✓</div>
        <h3 className={styles.successTitle}>Спасибо за ваш заказ!</h3>
        <p className={styles.successMessage}>
          В течение 5 минут с вами свяжется наш менеджер
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.title}>Контактные данные</h2>
      <form onSubmit={handleSubmit(onSubmitHandler)} className={styles.form}>
        {errors.root && (
          <div className={styles.rootError}>{errors.root.message}</div>
        )}

        <div className={styles.inputGroup}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <FormInput
                {...field}
                placeholder="Ваше имя"
                error={errors.fullName?.message}
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
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <div className={styles.dropdown}>
                <Dropdown
                  options={dropdownOptions}
                  placeholder="Выберите способ оплаты (не обязательно)"
                  onSelect={(selected) => {
                    const option = paymentOptions.find(
                      (opt) => opt.label === selected
                    );
                    if (option) {
                      field.onChange(option.value);
                    }
                  }}
                />
              </div>
            )}
          />
          {errors.paymentMethod?.message && (
            <span className={styles.errorMessage}>
              {errors.paymentMethod.message}
            </span>
          )}
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
                  acceptedTypes={[
                    "image/*",
                    "application/pdf",
                    ".doc",
                    ".docx",
                  ]}
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
            Прикрепить карточку предприятия
          </button>
        )}

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

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "Отправка..." : "Оформить заказ"}
          </button>
        </div>
      </form>
    </>
  );
};
