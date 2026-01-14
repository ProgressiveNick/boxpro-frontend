"use client";

export default function ErrorComponent({ error }: { error: Error }) {
  return <div>Ошибка: {error?.message || "Что-то пошло не так"}</div>;
}
