import { ReturnCallFormData, ReturnCallFormSubmitResult } from "./types";

export async function submitReturnCallForm(
  data: ReturnCallFormData
): Promise<ReturnCallFormSubmitResult> {
  try {
    const formData = new FormData();
    formData.append("phone", data.phone);

    // Добавляем URL страницы
    if (typeof window !== "undefined") {
      formData.append("urlPage", window.location.href);
    }

    const response = await fetch("/api/return-call", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return {
        success: true,
        message:
          "Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.",
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Ошибка при отправке заявки");
    }
  } catch (error) {
    console.error("Ошибка отправки формы:", error);
    return {
      success: false,
      message: "Произошла ошибка при отправке заявки. Попробуйте еще раз.",
    };
  }
}












