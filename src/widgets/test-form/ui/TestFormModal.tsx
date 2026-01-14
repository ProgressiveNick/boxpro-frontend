"use client";

import { TestForm } from "@/features/test-form";

type TestFormModalProps = {
  title?: string;
  description?: string;
  buttonText?: string;
};

export function TestFormModal(props: TestFormModalProps) {
  return <TestForm {...props} />;
}
