"use client";

import { useSpark, type TradeRole } from "@/components/spark/SparkProvider";
import { useI18n } from "@/features/i18n/useI18n";
import type { UiKey } from "@/features/i18n/ui";

const ROLES: { id: TradeRole; label: UiKey }[] = [
  { id: "buyer", label: "roleBuyer" },
  { id: "seller", label: "roleSeller" },
];

export function WireframeBanner() {
  const { tradeRole, setTradeRole } = useSpark();
  const { t } = useI18n();

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6">
        <p className="min-w-0 flex-1 text-xs leading-5 text-amber-950">
          {t("wireframeBanner")}
        </p>
        <div className="inline-flex shrink-0 rounded-full bg-white p-0.5 ring-1 ring-amber-200" role="group" aria-label="거래 롤">
          {ROLES.map((role) => {
            const selected = tradeRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTradeRole(role.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${selected ? "bg-slate-900 text-white" : "text-amber-900"}`}
              >
                {t(role.label)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
