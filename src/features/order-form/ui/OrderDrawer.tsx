"use client";

import { FC } from "react";
import dynamic from "next/dynamic";
import { OrderForm } from "./OrderForm";
import { OrderFormData } from "@/entities/order/model/types";

const Drawer = dynamic(() => import("antd").then((mod) => ({ default: mod.Drawer })), {
  ssr: false,
  loading: () => null, // Drawer не показывается до isOpen, поэтому loading не нужен
});

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OrderDrawer: FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const handleSubmit = async (data: OrderFormData) => {
    // Заказ уже обработан в OrderForm, здесь просто закрываем drawer
    console.log("Order submitted:", data);
    onClose();
  };

  const handleSuccess = () => {
    // Дополнительная логика после успешного заказа, если нужна
    console.log("Order completed successfully");
    onSuccess?.();
  };

  return (
    <Drawer
      title="Оформление заказа"
      placement="right"
      onClose={onClose}
      open={isOpen}
      width={400}
    >
      <OrderForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        onSuccess={handleSuccess}
        isOpen={isOpen}
      />
    </Drawer>
  );
};
