"use client";

import { ConsultationForm } from "@/features/consultation-form";
import { useUIStore } from "@/shared/store/useUIStore";

export function ConsultationFormModal() {
  const activeUI = useUIStore((s) => s.activeUI);
  const closeAll = useUIStore((s) => s.closeAll);

  return (
    <ConsultationForm
      isOpen={activeUI === "consultation"}
      onClose={closeAll}
      title="Получить консультацию"
      description="Оставьте заявку и наши специалисты помогут подобрать оборудование под ваш продукт"
      buttonText="Оставить заявку"
    />
  );
}





