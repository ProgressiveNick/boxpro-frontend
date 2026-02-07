"use client";

import React from "react";
import { FormCheckbox } from "@/shared/ui/FormCheckbox";
import styles from "./PersonalDataConsent.module.scss";

const PRIVACY_POLICY_URL =
  "https://docs.google.com/document/d/1OoHa-_O0RZ3eyH379jL3sYSTGRwd1LWE2F2IKxgJ-bw/edit?usp=sharing";

type PersonalDataConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
};

export function PersonalDataConsent({
  checked,
  onChange,
  error,
  className,
}: PersonalDataConsentProps) {
  const label = (
    <>
      Я согласен с{" "}
      <a
        href={PRIVACY_POLICY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        обработкой персональных данных
      </a>
    </>
  );

  return (
    <FormCheckbox
      checked={checked}
      onChange={onChange}
      label={label}
      error={error}
      className={className}
    />
  );
}
