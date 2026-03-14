"use client";

import { useUIStore } from "@/shared/store/useUIStore";
import { Button } from "@/shared/ui";
import styles from "./AdvantagesBlock.module.scss";

export function AdvantagesBlockCtaButton() {
  const openConsultationForm = useUIStore((s) => s.openConsultationForm);

  return (
    <Button
      className={styles.ctaButton}
      variant="secondary"
      onClick={openConsultationForm}
    >
      Получить консультацию
    </Button>
  );
}
