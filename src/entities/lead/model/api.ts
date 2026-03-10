import { submitLeadForm as submitLeadFormAction } from "../api/actions";
import { LeadFormData, LeadSubmitResult } from "./types";

export async function submitLeadForm(
  data: LeadFormData
): Promise<LeadSubmitResult> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("phone", data.phone);
  if (data.message) {
    formData.append("message", data.message);
  }
  if (typeof window !== "undefined") {
    formData.append("urlPage", window.location.href);
  }

  const result = await submitLeadFormAction(formData);

  if (result.success) {
    return {
      success: true,
      message: result.message ?? "Заявка успешно отправлена! Менеджер уже спешит связаться с вами!",
    };
  }
  return {
    success: false,
    message: result.error ?? "Произошла ошибка при отправке заявки. Попробуйте еще раз.",
  };
}
