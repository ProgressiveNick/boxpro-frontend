import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  message: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

export interface LeadSubmitResult {
  success: boolean;
  message: string;
} 