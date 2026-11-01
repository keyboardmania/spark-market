import type { Condition, SaleStatus } from "@/data/mockData";

const CONDITION_CLASS: Record<Condition, string> = {
  PSA10: "bg-stone-100 text-stone-700",
  BGS: "bg-slate-100 text-slate-600",
  "S급 미개봉": "bg-rose-50 text-rose-700",
  S급: "bg-amber-50 text-amber-800",
  A급: "bg-sky-50 text-sky-800",
  B급: "bg-zinc-100 text-zinc-500",
};

export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${CONDITION_CLASS[condition]}`}>
      {condition}
    </span>
  );
}

const STATUS_CLASS: Record<SaleStatus, string> = {
  판매중: "text-emerald-600",
  예약중: "text-amber-600",
  판매완료: "text-slate-400",
};

export function SparkVipBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-white">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-300" />
      Spark VIP
    </span>
  );
}

export function SaleStatusText({ status }: { status: SaleStatus }) {
  return <span className={`text-xs font-medium ${STATUS_CLASS[status]}`}>{status}</span>;
}
