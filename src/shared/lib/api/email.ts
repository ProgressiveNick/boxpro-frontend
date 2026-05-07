import nodemailer from "nodemailer";
import { SMTP_CONFIG } from "@/shared/config/api";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

const transporter = nodemailer.createTransport({
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: SMTP_CONFIG.secure,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass,
  },
});

export async function sendEmailMessage(
  subject: string,
  text: string
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to: SMTP_CONFIG.to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error("Ошибка отправки письма:", error);
    return false;
  }
}

export async function sendEmailMessageWithFiles(
  subject: string,
  text: string,
  files?: EmailAttachment[]
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: SMTP_CONFIG.from,
      to: SMTP_CONFIG.to,
      subject,
      text,
      attachments: files,
    });
    return true;
  } catch (error) {
    console.error("Ошибка отправки письма с вложениями:", error);
    return false;
  }
}
