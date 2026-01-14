import { z } from "zod";

export const testFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
  files: z.array(z.instanceof(File)).optional(),
});

export type TestFormData = z.infer<typeof testFormSchema>;

export interface TestFormSubmitResult {
  success: boolean;
  message: string;
}





