import type { ReactNode } from "react";

export function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-xs text-slate-500">
      <span>{label}</span>
      {children}
    </label>
  );
}
