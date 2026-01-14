import { z } from "zod";

export const returnCallFormSchema = z.object({
  phone: z.string().min(10, "Введите корректный номер телефона"),
});

export type ReturnCallFormData = z.infer<typeof returnCallFormSchema>;

export interface ReturnCallFormSubmitResult {
  success: boolean;
  message: string;
}





