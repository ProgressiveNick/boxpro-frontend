export type OrderFormData = {
  fullName: string;
  phone: string;
  paymentMethod?: PaymentMethod;
  files?: File[];
  order?: {
    name: string;
    documentId: string;
    count: number;
    sum: number;
  }[];
};

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  REQUISITE = "REQUISITE",
  CREDIT = "CREDIT",
  LIZING = "LIZING",
}
