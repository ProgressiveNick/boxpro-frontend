"use client";

import { TestForm } from "@/features/test-form";
import { useUIStore } from "@/shared/store/useUIStore";

type TestFormModalProps = {
  title?: string;
  description?: string;
  buttonText?: string;
};

export function TestFormModal(props: TestFormModalProps) {
  const activeUI = useUIStore((s) => s.activeUI);
  const closeAll = useUIStore((s) => s.closeAll);

  return (
    <TestForm
      {...props}
      isOpen={activeUI === "test"}
      onClose={closeAll}
    />
  );
}
