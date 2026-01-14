import { TestFormData, TestFormSubmitResult } from "./types";

export async function submitTestForm(
  data: TestFormData
): Promise<TestFormSubmitResult> {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    formData.append("company", ""); // Пустая строка для обратной совместимости
    formData.append("message", ""); // Пустая строка для обратной совместимости

    if (data.files) {
      data.files.forEach((file) => {
        formData.append(`files`, file);
      });
    }

    // Добавляем URL страницы
    if (typeof window !== "undefined") {
      formData.append("urlPage", window.location.href);
    }

    const response = await fetch("/api/test-form", {
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





