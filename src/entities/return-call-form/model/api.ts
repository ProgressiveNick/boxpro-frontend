import { submitReturnCall } from "../api/actions";
import { ReturnCallFormData, ReturnCallFormSubmitResult } from "./types";

export async function submitReturnCallForm(
  data: ReturnCallFormData
): Promise<ReturnCallFormSubmitResult> {
  const formData = new FormData();
  formData.append("phone", data.phone);
  if (typeof window !== "undefined") {
    formData.append("urlPage", window.location.href);
  }

  const result = await submitReturnCall(formData);

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





