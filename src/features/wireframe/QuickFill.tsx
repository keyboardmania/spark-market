"use client";

import { useI18n } from "@/features/i18n/useI18n";

export function QuickFill({ onFill }: { onFill: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onFill}
      className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-400 transition hover:border-slate-400 hover:text-slate-600"
    >
      {t("quickFill")}
    </button>
  );
}
