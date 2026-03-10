"use server";

import { submitLeadFormLogic } from "./leadFormLogic";

export async function submitLeadForm(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const message = (formData.get("message") as string) || undefined;
  const urlPage = (formData.get("urlPage") as string) || undefined;

  if (!name || !phone) {
    return { success: false, error: "Не все обязательные поля заполнены" };
  }

  return submitLeadFormLogic({ name, phone, message, urlPage });
}
