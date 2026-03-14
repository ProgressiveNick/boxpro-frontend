"use client";

import { ReturnCallForm } from "@/features/return-call-form";
import { useUIStore } from "@/shared/store/useUIStore";

export function ReturnCallFormModal() {
  const activeUI = useUIStore((s) => s.activeUI);
  const closeAll = useUIStore((s) => s.closeAll);

  return (
    <ReturnCallForm
      isOpen={activeUI === "returnCall"}
      onClose={closeAll}
    />
  );
}
