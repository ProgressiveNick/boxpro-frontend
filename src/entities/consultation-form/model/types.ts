import { z } from "zod";

export const consultationFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  message: z.string().optional(),
});

export type ConsultationFormData = z.infer<typeof consultationFormSchema>;

export interface ConsultationFormSubmitResult {
  success: boolean;
  message: string;
}





