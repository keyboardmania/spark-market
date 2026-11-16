"use client";

import { useCallback } from "react";
import { useSpark } from "@/components/spark/SparkProvider";
import { UI, type UiKey } from "@/features/i18n/ui";

export function useI18n() {
  const { locale } = useSpark();
  const t = useCallback((key: UiKey) => UI[locale][key], [locale]);
  return { locale, t };
}
