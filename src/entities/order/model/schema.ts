import { z } from "zod";
import { PaymentMethod } from "./types";

export const orderFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Имя должно содержать минимум 2 символа")
    .max(100, "Имя не должно превышать 100 символов"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  paymentMethod: z
    .enum(Object.values(PaymentMethod) as [string, ...string[]], {
      error: "Выберите способ оплаты",
    })
    .optional(),
  files: z.array(z.instanceof(File)).optional(),
  order: z
    .array(
      z.object({
        name: z.string(),
        documentId: z.string(),
        count: z.number().positive("Количество должно быть больше 0"),
        sum: z.number().positive("Сумма должна быть больше 0"),
      }),
    )
    .optional(),
  personalDataConsent: z
    .boolean()
    .refine((val) => val === true, "Необходимо ваше согласие"),
});

export type OrderFormSchema = z.infer<typeof orderFormSchema>;
