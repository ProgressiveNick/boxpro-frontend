"use server";

import { submitTestFormLogic } from "./testFormLogic";

export async function submitTestForm(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string;
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;
  const urlPage = (formData.get("urlPage") as string) || undefined;
  const files = formData.getAll("files") as File[];

  if (!name || !company || !phone || !message) {
    return { success: false, error: "Не все обязательные поля заполнены" };
  }

  const processedFiles: { name: string; type: string; size: number; buffer: Buffer }[] = [];
  for (const file of files) {
    if (file && "arrayBuffer" in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        buffer,
      });
    }
  }

  return submitTestFormLogic({
    name,
    company,
    phone,
    message,
    urlPage,
    files: processedFiles,
  });
}
