"use client";

import { MessageCircle } from "lucide-react";
import styles from "./QuestionTab.module.scss";

type QuestionTabProps = {
  label?: string;
  onClick?: () => void;
  className?: string;
};

export function QuestionTab({
  label = "Задать вопрос",
  onClick,
  className,
}: QuestionTabProps) {
  return (
    <div className={`${styles.questionTab} ${className || ""}`} onClick={onClick}>
      <MessageCircle className={styles.messageIcon} size={16} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
















