import type { ReactNode } from "react";

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

export function DataTable({ children, wide = true }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${wide ? "min-w-[720px]" : ""}`}>{children}</table>
    </div>
  );
}

export const thClass = "px-4 py-3 text-[11px] font-medium tracking-wide text-slate-400";
export const tdClass = "border-t border-slate-100 px-4 py-3 align-middle text-slate-700";
