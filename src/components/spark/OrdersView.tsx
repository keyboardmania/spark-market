"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatPrice, type Order, type OrderStatus } from "@/data/mockData";
import { InfiniteSentinel, useInfiniteGrid } from "@/components/spark/GridPager";
import { SalesManageView } from "@/components/spark/SalesManageView";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useI18n } from "@/features/i18n/useI18n";
import { statusLabel } from "@/features/i18n/ui";
import { useMounted } from "@/components/spark/useMounted";

const BUY_STATUS_FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "OPEN", label: "거래 진행 중" },
  { id: "DONE", label: "거래 완료/정산" },
  { id: "CANCELLED", label: "거래 취소" },
] as const;

type OrderTab = "buy" | "sale";
type BuyStatusFilter = (typeof BUY_STATUS_FILTERS)[number]["id"];
type BuyPhase = "OPEN" | "DONE" | "CANCELLED";

const TRADE_TONE = {
  "판매 중": "bg-slate-100 text-slate-600",
  "예약 중": "bg-amber-50 text-amber-800",
  "결제/진행 중": "bg-sky-50 text-sky-700",
  "거래 완료": "bg-emerald-50 text-emerald-700",
  거래취소: "bg-zinc-100 text-zinc-400",
} as const;

export function buyPhase(status: OrderStatus): BuyPhase {
  if (status === "구매확정") return "DONE";
  if (status === "거래취소") return "CANCELLED";
  return "OPEN";
}

export function orderTradePresentation(role: Order["role"], status: OrderStatus) {
  if (status === "거래취소") return { label: "거래취소" as const, tone: TRADE_TONE.거래취소 };
  if (role === "sale") {
    const tone = status === "구매확정" ? TRADE_TONE["거래 완료"] : TRADE_TONE["결제/진행 중"];
    return { label: status, tone };
  }
  const phase = buyPhase(status);
  const label = phase === "DONE" ? "거래 완료" : "결제/진행 중";
  return { label, tone: TRADE_TONE[label] };
}

function parseBuyFilter(value: string | null): BuyStatusFilter {
  if (value === "OPEN" || value === "PAYING" || value === "SHIPPING") return "OPEN";
  if (value === "DONE" || value === "SETTLED") return "DONE";
  if (value === "CANCELLED") return "CANCELLED";
  return "ALL";
}

function resolveTab(tabParam: string | null): OrderTab {
  if (tabParam === "sale") return "sale";
  if (tabParam === "buy" || tabParam === "purchase") return "buy";
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
  const { t } = useI18n();
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const statusParam = searchParams.get("filter") ?? searchParams.get("status");
  const tab = resolveTab(searchParams.get("tab"));
  const buyFilter = tab === "buy" ? parseBuyFilter(statusParam) : "ALL";

  function replaceQuery(params: URLSearchParams) {
    const query = params.toString();
    router.replace(query ? `/orders?${query}` : "/orders", { scroll: false });
  }

  function selectTab(next: OrderTab) {
    const params = new URLSearchParams();
    params.set("tab", next);
    replaceQuery(params);
  }

  function selectFilter(next: BuyStatusFilter) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (next !== "ALL") params.set("filter", next);
    replaceQuery(params);
  }

  const purchases = orders.filter((order) => order.role === "purchase" && (buyFilter === "ALL" || buyPhase(order.status) === buyFilter));
  const { visibleCount, hasMore, sentinelRef } = useInfiniteGrid(purchases.length, `${tab}:${buyFilter}`);
  const visible = purchases.slice(0, visibleCount);

  if (!mounted && tab === "buy") {
    return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  function confirmPurchase(order: Order) {
    updateOrder(order.id, { status: "구매확정" });
    notify("구매를 확정했어요.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">ORDERS</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">구매/판매 내역</h1>
          <p className="mt-2 text-sm text-slate-500">
            {tab === "sale"
              ? "주문 상세에서 정산과 통관 기록을 확인해요."
              : "카드를 누르면 주문 상세로 이동해요. 구매확정과 배송 조회만 목록에서 바로 할 수 있어요."}
          </p>
        </div>
      </div>
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

      {tab === "sale" ? <SalesManageView /> : (
      <>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="거래 상태">
        {BUY_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={buyFilter === filter.id}
            onClick={() => selectFilter(filter.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${buyFilter === filter.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          {buyFilter !== "ALL" ? "해당 상태의 내역이 없어요." : "구매 내역이 없어요."}
        </p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((order) => {
              const trade = orderTradePresentation(order.role, order.status);
              const canConfirm = order.status === "배송완료";
              const canTrack = order.status === "배송중" && Boolean(order.tracking);
              return (
                <li key={order.id}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-400">
                    <Link
                      href={`/orders/${order.id}`}
                      aria-label={order.title}
                      className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-900"
                    />
                    <ProductVisual motif={order.motif} palette={order.palette} uid={order.id} imageUrl={order.imageUrl} alt="" className="aspect-square w-full" />
                    <div className="flex flex-1 flex-col gap-2 p-3">
                      <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${trade.tone}`}>{statusLabel(t, trade.label)}</span>
                      <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900 group-hover:underline">{order.title}</h2>
                      <p className="text-sm font-semibold tabular-nums text-slate-900">{formatPrice(order.price)}</p>
                      <p className="text-xs leading-5 text-slate-500">{t("partySeller")} {order.counterpart}</p>
                      {order.status === "배송완료" ? <p className="text-xs leading-5 text-slate-400">배송완료 후 5일이 지나면 자동 구매확정됩니다.</p> : null}
                      {canConfirm || canTrack ? (
                        <div className="relative z-20 mt-auto pt-1">
                          {canConfirm ? <button type="button" onClick={() => confirmPurchase(order)} className={`${miniPrimary} w-full`}>구매 확정</button> : null}
                          {canTrack ? (
                            <button type="button" onClick={() => setTrackingId(order.id)} className={`${miniGhost} w-full`}>배송 조회</button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
          <InfiniteSentinel active={hasMore} sentinelRef={sentinelRef} />
        </>
      )}
      {trackingId ? <BuyTrackDialog order={orders.find((order) => order.id === trackingId) ?? null} onClose={() => setTrackingId(null)} /> : null}
      </>
      )}
    </div>
  );
}

function BuyTrackDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order?.tracking) return null;
  const delivered = order.status === "배송완료" || order.status === "구매확정";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="track-buy-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 id="track-buy-title" className="text-lg font-semibold text-slate-900">배송 조회</h2>
        <p className="mt-2 text-sm text-slate-500">운송장 {order.tracking}</p>
        <ol className="mt-4 space-y-2 text-sm text-slate-500">
          <li>결제완료 · 판매자가 주문을 확인했어요</li>
          <li>상품인수 · 택배사에 전달됐어요</li>
          <li className={order.status !== "결제완료" ? "text-slate-800" : ""}>배송중 · 이동하고 있어요</li>
          <li className={delivered ? "text-slate-800" : ""}>배송완료</li>
        </ol>
        <button type="button" onClick={onClose} className={`${primaryButtonClass} mt-5 w-full`}>닫기</button>
      </div>
    </div>
  );
}

const miniPrimary = "inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white";
const miniGhost = "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700";
