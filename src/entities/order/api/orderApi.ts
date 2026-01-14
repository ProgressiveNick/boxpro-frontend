import { OrderFormData } from "../model/types";

export interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: number;
}

export const orderApi = {
  async submitOrder(orderData: OrderFormData): Promise<OrderResponse> {
    try {
      const formData = new FormData();

      formData.append("fullName", orderData.fullName);
      formData.append("phone", orderData.phone);
      if (orderData.paymentMethod) {
        formData.append("paymentMethod", orderData.paymentMethod);
      }

      // Добавляем товары как JSON
      formData.append("order", JSON.stringify(orderData.order));

      // Добавляем файлы
      if (orderData.files && orderData.files.length > 0) {
        orderData.files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await fetch("/api/order", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка отправки заказа");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка отправки заказа:", error);
      throw error;
    }
  },
};
