"use server";

import { submitReturnCallLogic } from "./returnCallLogic";

export async function submitReturnCall(formData: FormData) {
  const phone = formData.get("phone") as string;
  const urlPage = (formData.get("urlPage") as string) || undefined;

  if (!phone) {
    return { success: false, error: "Не все обязательные поля заполнены" };
  }

  return submitReturnCallLogic({ phone, urlPage });
}
