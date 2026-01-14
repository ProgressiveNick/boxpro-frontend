import { ConsultationFormData, ConsultationFormSubmitResult } from "./types";

export async function submitConsultationForm(
  data: ConsultationFormData
): Promise<ConsultationFormSubmitResult> {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    if (data.message) {
      formData.append("message", data.message);
    }

    // Добавляем URL страницы
    if (typeof window !== "undefined") {
      formData.append("urlPage", window.location.href);
    }

    const response = await fetch("/api/lead-form", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return {
        success: true,
        message:
          "Заявка успешно отправлена! Менеджер уже спешит связаться с вами!",
      };
    } else {
      throw new Error("Ошибка при отправке заявки");
    }
  } catch (error) {
    console.error("Ошибка отправки формы:", error);
    return {
      success: false,
      message: "Произошла ошибка при отправке заявки. Попробуйте еще раз.",
    };
  }
}





