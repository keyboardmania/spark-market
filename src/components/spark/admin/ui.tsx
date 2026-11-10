"use client";

import { useEffect, type ReactNode } from "react";

export function Panel({
  title,
  description,
  action,
  children,
  flush = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className={flush ? "border-t border-slate-100" : "border-t border-slate-100 px-5 py-4"}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
      <p className="text-xs font-medium tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 font-serif text-3xl tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </article>
  );
}

export function StatusPill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "rose" | "amber" | "emerald" | "sky" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-800",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function DataTable({ children, wide = true, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${className || (wide ? "min-w-[720px]" : "")}`}>{children}</table>
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-2">{children}</div>;
}

export function FilterField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex min-w-[200px] flex-1 flex-col gap-1.5 text-[11px] font-medium tracking-wide text-slate-400 sm:max-w-xs ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export const thClass = "px-4 py-3 text-[11px] font-medium tracking-wide text-slate-400";
export const tdClass = "border-t border-slate-100 px-4 py-3 align-middle text-slate-700";

export function DetailModal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-detail-title"
        className={`max-h-[85dvh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${wide ? "max-w-2xl" : "max-w-lg"}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="admin-detail-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-50">
            닫기
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function DetailRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-100">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 py-2.5 text-sm">
          <dt className="text-slate-400">{row.label}</dt>
          <dd className="min-w-0 text-slate-800">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
