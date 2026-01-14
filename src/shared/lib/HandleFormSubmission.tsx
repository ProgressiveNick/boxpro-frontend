"use server";

export async function handleFormSubmission(formData: FormData) {
  // Эмулируем обработку (например, сохранение данных в базу)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = Object.fromEntries(formData.entries());
  console.log("Обработанные данные формы:", data);

  // Например, возвращаем успех (можно поменять на redirect или другое действие)
  return { success: true };
}
