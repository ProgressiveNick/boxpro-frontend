"use client";

import React, { useEffect } from "react";
import styles from "./Message.module.scss";
import ReactDOM from "react-dom/client";

interface MessageProps {
  type: "success" | "error" | "info" | "warning";
  content: string;
  duration?: number;
  onClose?: () => void;
}

export function Message({
  type,
  content,
  duration = 3000,
  onClose,
}: MessageProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.message} ${styles[type]}`}>
      <span className={styles.content}>{content}</span>
      <button className={styles.closeButton} onClick={onClose}>
        ×
      </button>
    </div>
  );
}

// Функции для удобного использования
export const message = {
  success: (content: string, duration?: number) => {
    showMessage("success", content, duration);
  },
  error: (content: string, duration?: number) => {
    showMessage("error", content, duration);
  },
  info: (content: string, duration?: number) => {
    showMessage("info", content, duration);
  },
  warning: (content: string, duration?: number) => {
    showMessage("warning", content, duration);
  },
};

let messageContainer: HTMLDivElement | null = null;

function showMessage(
  type: "success" | "error" | "info" | "warning",
  content: string,
  duration = 3000
) {
  if (!messageContainer) {
    messageContainer = document.createElement("div");
    messageContainer.className = styles.messageContainer;
    document.body.appendChild(messageContainer);
  }

  const messageElement = document.createElement("div");
  messageContainer.appendChild(messageElement);

  const handleClose = () => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement);
    }
  };

  // Рендерим React компонент в DOM элемент
  const root = ReactDOM.createRoot(messageElement);
  root.render(
    <Message
      type={type}
      content={content}
      duration={duration}
      onClose={handleClose}
    />
  );
}
