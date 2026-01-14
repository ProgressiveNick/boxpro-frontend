"use client";

import { ConsultationForm } from "@/features/consultation-form";
import { useConsultationFormStore } from "../model/store";

export function ConsultationFormModal() {
  const { isOpen, closeForm } = useConsultationFormStore();

  return (
    <ConsultationForm
      isOpen={isOpen}
      onClose={closeForm}
      title="Получить консультацию"
      description="Оставьте заявку и наши специалисты помогут подобрать оборудование под ваш продукт"
      buttonText="Оставить заявку"
    />
  );
}





