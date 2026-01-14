"use client";

import { useConsultationFormStore } from "@/widgets/consultation-form";
import { Button } from "@/shared/ui";
import styles from "./AdvantagesBlock.module.scss";

export function AdvantagesBlockCtaButton() {
  const { openForm } = useConsultationFormStore();

  return (
    <Button className={styles.ctaButton} variant="secondary" onClick={openForm}>
      Получить консультацию
    </Button>
  );
}
