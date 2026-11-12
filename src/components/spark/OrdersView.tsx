"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatPrice, type Order, type OrderStatus } from "@/data/mockData";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const SALE_STATUS_FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "SELLING", label: "판매 중" },
  { id: "RESERVED", label: "예약 중" },
  { id: "DONE", label: "거래 완료" },
] as const;

const BUY_STATUS_FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "PAYING", label: "결제/진행 중" },
  { id: "DONE", label: "거래 완료" },
] as const;

type OrderTab = "buy" | "sale";
type SaleStatusFilter = (typeof SALE_STATUS_FILTERS)[number]["id"];
type BuyStatusFilter = (typeof BUY_STATUS_FILTERS)[number]["id"];
type SalePhase = Exclude<SaleStatusFilter, "ALL"> | "CANCELLED";
type BuyPhase = Exclude<BuyStatusFilter, "ALL"> | "CANCELLED";

const TRADE_TONE = {
  "판매 중": "bg-slate-100 text-slate-600",
  "예약 중": "bg-amber-50 text-amber-800",
  "결제/진행 중": "bg-sky-50 text-sky-700",
  "거래 완료": "bg-emerald-50 text-emerald-700",
  거래취소: "bg-zinc-100 text-zinc-400",
} as const;

export function salePhase(status: OrderStatus): SalePhase {
  if (status === "구매확정") return "DONE";
  if (status === "거래취소") return "CANCELLED";
  if (status === "배송중" || status === "배송완료") return "RESERVED";
  return "SELLING";
}

export function buyPhase(status: OrderStatus): BuyPhase {
  if (status === "구매확정") return "DONE";
  if (status === "거래취소") return "CANCELLED";
  return "PAYING";
}

export function orderTradePresentation(role: Order["role"], status: OrderStatus) {
  if (status === "거래취소") return { label: "거래취소" as const, tone: TRADE_TONE.거래취소 };
  if (role === "sale") {
    const phase = salePhase(status);
    const label = phase === "RESERVED" ? "예약 중" : phase === "DONE" ? "거래 완료" : "판매 중";
    return { label, tone: TRADE_TONE[label] };
  }
  const phase = buyPhase(status);
  const label = phase === "DONE" ? "거래 완료" : "결제/진행 중";
  return { label, tone: TRADE_TONE[label] };
}

function parseSaleFilter(value: string | null): SaleStatusFilter {
  if (value === "SELLING" || value === "RESERVED" || value === "DONE") return value;
  return "ALL";
}

function parseBuyFilter(value: string | null): BuyStatusFilter {
  if (value === "PAYING" || value === "DONE") return value;
  return "ALL";
}

function resolveTab(tabParam: string | null, statusParam: string | null): OrderTab {
  if (tabParam === "sale") return "sale";
  if (tabParam === "buy" || tabParam === "purchase") return "buy";
  if (statusParam === "SELLING" || statusParam === "RESERVED") return "sale";
  return "buy";
}

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  결제완료: TRADE_TONE["판매 중"],
  배송중: TRADE_TONE["예약 중"],
  배송완료: TRADE_TONE["예약 중"],
  구매확정: TRADE_TONE["거래 완료"],
  거래취소: TRADE_TONE.거래취소,
};

export function OrdersView() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { orders, updateOrder, notify } = useSpark();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const statusParam = searchParams.get("status");
  const tab = resolveTab(searchParams.get("tab"), statusParam);
  const saleFilter = tab === "sale" ? parseSaleFilter(statusParam) : "ALL";
  const buyFilter = tab === "buy" ? parseBuyFilter(statusParam) : "ALL";
  const activeFilter = tab === "sale" ? saleFilter : buyFilter;

  function replaceQuery(params: URLSearchParams) {
    const query = params.toString();
    router.replace(query ? `/orders?${query}` : "/orders", { scroll: false });
  }

  function selectTab(next: OrderTab) {
    const params = new URLSearchParams();
    params.set("tab", next);
    replaceQuery(params);
  }

  function selectFilter(next: SaleStatusFilter | BuyStatusFilter) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (next !== "ALL") params.set("status", next);
    replaceQuery(params);
  }

  if (!mounted) {
    return <div className="mx-auto max-w-4xl px-4 py-8"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  const visible = orders.filter((order) => {
    if (tab === "sale") {
      if (order.role !== "sale") return false;
      return saleFilter === "ALL" || salePhase(order.status) === saleFilter;
    }
    if (order.role !== "purchase") return false;
    return buyFilter === "ALL" || buyPhase(order.status) === buyFilter;
  });

  function confirmPurchase(order: Order) {
    updateOrder(order.id, { status: "구매확정" });
    notify("구매를 확정했어요.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">ORDERS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">구매/판매 내역</h1>
      <div className="mt-6 flex gap-2" role="tablist" aria-label="내역 구분">
        {(
          [
            ["buy", "구매 내역"],
            ["sale", "판매 내역"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => selectTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="거래 상태">
        {(tab === "sale" ? SALE_STATUS_FILTERS : BUY_STATUS_FILTERS).map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={activeFilter === filter.id}
            onClick={() => selectFilter(filter.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${activeFilter === filter.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          {activeFilter !== "ALL" ? "해당 상태의 내역이 없어요." : "내역이 없어요."}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((order) => {
            const isPurchase = order.role === "purchase";
            const trade = orderTradePresentation(order.role, order.status);
            const canConfirm = isPurchase && order.status === "배송완료";
            const canLinkCancel = order.status !== "구매확정" && order.status !== "거래취소";
            const canTrack = Boolean(order.tracking) && order.status !== "거래취소";
            return (
              <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex gap-4">
                  <Link href={`/orders/${order.id}`} className="shrink-0 rounded-xl">
                    <ProductVisual motif={order.motif} palette={order.palette} uid={order.id} imageUrl={order.imageUrl} alt="" className="h-24 w-24 rounded-xl" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${trade.tone}`}>{trade.label}</span>
                      <span className="text-xs text-slate-400">{order.orderedAt}</span>
                    </div>
                    <h2 className="mt-2 text-base font-medium text-slate-900">
                      <Link href={`/orders/${order.id}`} className="hover:underline">{order.title}</Link>
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{isPurchase ? "판매자" : "구매자"} {order.counterpart} · {formatPrice(order.price)}</p>
                  </div>
                </div>

                {isPurchase && order.status === "배송완료" ? (
                  <p className="mt-3 text-xs leading-5 text-slate-400">배송완료 후 5일이 지나면 자동 구매확정됩니다.</p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={!canConfirm} onClick={() => confirmPurchase(order)} className={primaryButtonClass}>구매 확정</button>
                  {canLinkCancel ? (
                    <Link href={`/orders/${order.id}?cancel=1`} className={ghostButtonClass}>거래 취소</Link>
                  ) : null}
                  <button type="button" disabled={!canTrack} onClick={() => setTrackingId(trackingId === order.id ? null : order.id)} className={ghostButtonClass}>배송 조회</button>
                </div>

                {trackingId === order.id && order.tracking ? (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <p className="font-medium text-slate-800">운송장 {order.tracking}</p>
                    <ol className="mt-3 space-y-2 text-slate-500">
                      <li>결제완료 · 판매자가 주문을 확인했어요</li>
                      <li>상품인수 · 택배사에 전달됐어요</li>
                      <li className={order.status === "배송완료" || order.status === "구매확정" ? "text-slate-800" : ""}>배송중 · 이동하고 있어요</li>
                      <li className={order.status === "배송완료" || order.status === "구매확정" ? "text-slate-800" : ""}>배송완료</li>
                    </ol>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
