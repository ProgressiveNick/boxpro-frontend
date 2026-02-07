import { z } from "zod";

export const returnCallFormSchema = z.object({
  phone: z.string().min(10, "Введите корректный номер телефона"),
  personalDataConsent: z
    .boolean()
    .refine((val) => val === true, "Необходимо ваше согласие"),
});

export type ReturnCallFormData = z.infer<typeof returnCallFormSchema>;

export interface ReturnCallFormSubmitResult {
  success: boolean;
  message: string;
}
