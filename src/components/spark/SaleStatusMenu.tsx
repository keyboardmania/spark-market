"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SALE_STATUSES, type SaleStatus } from "@/data/mockData";
import { useI18n } from "@/features/i18n/useI18n";
import { statusLabel } from "@/features/i18n/ui";

const TONE: Record<SaleStatus, string> = {
  판매중: "bg-emerald-50 text-emerald-700",
  예약중: "bg-amber-50 text-amber-800",
  판매완료: "bg-slate-100 text-slate-600",
};

const DOT: Record<SaleStatus, string> = {
  판매중: "bg-emerald-500",
  예약중: "bg-amber-500",
  판매완료: "bg-slate-400",
};

export function SaleStatusMenu({
  status,
  onChange,
  disabled = false,
}: {
  status: SaleStatus;
  onChange: (status: SaleStatus) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE[status]} disabled:opacity-50`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
        {statusLabel(t, status)}
        <span aria-hidden className="text-[10px] opacity-70">
          ▾
        </span>
      </button>
      {open ? (
        <ul id={menuId} role="menu" className="absolute left-0 top-full z-30 mt-1 w-36 rounded-2xl border border-slate-200 bg-white p-1 shadow-lg">
          {SALE_STATUSES.map((option) => {
            const selected = option === status;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setOpen(false);
                    if (option !== status) onChange(option);
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm ${selected ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : DOT[option]}`} />
                  {statusLabel(t, option)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
