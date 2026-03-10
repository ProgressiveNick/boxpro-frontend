import { submitOrder as submitOrderAction } from "./actions";
import { OrderFormData } from "../model/types";

export interface OrderResponse {
  success: boolean;
  message?: string;
  orderId?: number;
}

export const orderApi = {
  async submitOrder(orderData: OrderFormData): Promise<OrderResponse> {
    const formData = new FormData();

    formData.append("fullName", orderData.fullName);
    formData.append("phone", orderData.phone);
    if (orderData.paymentMethod) {
      formData.append("paymentMethod", orderData.paymentMethod);
    }

    formData.append("order", JSON.stringify(orderData.order ?? []));

    if (orderData.files && orderData.files.length > 0) {
      orderData.files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const result = await submitOrderAction(formData);

    if (!result.success) {
      throw new Error(result.error ?? "Ошибка отправки заказа");
    }

    return {
      success: true,
      message: "Заказ успешно оформлен",
      orderId: result.orderId,
    };
  },
};
