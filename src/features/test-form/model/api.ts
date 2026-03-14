import { submitTestForm as submitTestFormAction } from "@/entities/test-form/api/actions";
import { TestFormData, TestFormSubmitResult } from "./types";

export async function submitTestForm(
  data: TestFormData
): Promise<TestFormSubmitResult> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("company", data.company ?? "");
  formData.append("phone", data.phone);
  formData.append("message", data.message ?? "");

  if (data.files) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  if (typeof window !== "undefined") {
    formData.append("urlPage", window.location.href);
  }

  const result = await submitTestFormAction(formData);

  if (result.success) {
    return {
      success: true,
      message: result.message ?? "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
    };
  }
  return {
    success: false,
    message: result.error ?? "Произошла ошибка при отправке заявки. Попробуйте еще раз.",
  };
}
