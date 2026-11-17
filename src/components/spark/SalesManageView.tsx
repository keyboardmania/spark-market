"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  formatPrice,
  settlementOf,
  type Order,
  type OrderStatus,
  type Product,
} from "@/data/mockData";
import { InfiniteSentinel, useInfiniteGrid } from "@/components/spark/GridPager";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "OPEN", label: "거래 진행 중" },
  { id: "DONE", label: "거래 완료" },
  { id: "CANCELLED", label: "거래 취소" },
] as const;

type SaleFilter = (typeof FILTERS)[number]["id"];

type DeskItem = { key: string; kind: "order"; order: Order };

const TONE: Record<string, string> = {
  판매중: "bg-emerald-50 text-emerald-700",
  예약중: "bg-amber-50 text-amber-800",
  판매완료: "bg-slate-100 text-slate-500",
  "수락 대기": "bg-rose-50 text-rose-700",
  결제완료: "bg-sky-50 text-sky-700",
  배송중: "bg-sky-50 text-sky-700",
  배송완료: "bg-amber-50 text-amber-800",
  구매확정: "bg-emerald-50 text-emerald-700",
  거래취소: "bg-zinc-100 text-zinc-400",
  정산대기: "bg-amber-50 text-amber-800",
  정산완료: "bg-emerald-50 text-emerald-700",
  정산취소: "bg-zinc-100 text-zinc-400",
};

function parseFilter(value: string | null): SaleFilter {
  if (value === "OPEN" || value === "SHIPPING" || value === "REQUEST" || value === "PAYING") return "OPEN";
  if (value === "DONE" || value === "SETTLED" || value === "SOLD") return "DONE";
  if (value === "CANCELLED") return "CANCELLED";
  return "ALL";
}

function orderPhase(status: OrderStatus): Exclude<SaleFilter, "ALL"> {
  if (status === "구매확정") return "DONE";
  if (status === "거래취소") return "CANCELLED";
  return "OPEN";
}

function settlementState(status: OrderStatus) {
  if (status === "구매확정") return "정산완료";
  if (status === "거래취소") return "정산취소";
  return "정산대기";
}

export function SalesManageView() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, orders, user, updateOrder, notify } = useSpark();
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);
  const filter = parseFilter(searchParams.get("filter") ?? searchParams.get("status"));
  const vip = user?.membership === "vip";

  const items = mounted ? collectItems(filter, orders) : [];
  const { visibleCount, hasMore, sentinelRef } = useInfiniteGrid(items.length, filter);
  const visible = items.slice(0, visibleCount);

  function replaceQuery(params: URLSearchParams) {
    const query = params.toString();
    router.replace(query ? `/orders?${query}` : "/orders", { scroll: false });
  }

  function selectFilter(next: SaleFilter) {
    const params = new URLSearchParams();
    params.set("tab", "sale");
    if (next !== "ALL") params.set("filter", next);
    replaceQuery(params);
  }

  function saveTracking(tracking: string) {
    if (!shipOrder) return;
    const nextStatus = shipOrder.status === "결제완료" ? "배송중" : shipOrder.status;
    updateOrder(shipOrder.id, { tracking, status: nextStatus });
    notify(shipOrder.status === "결제완료" ? "운송장을 등록하고 배송중으로 바꿨어요." : "운송장을 수정했어요.");
    setShipOrder(null);
  }

  if (!mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="판매 상태">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => selectFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${filter === item.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          {emptyLabel(filter)}
        </p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((item) => (
              <li key={item.key}>
                <DeskCard
                  item={item}
                  vip={vip}
                  product={item.kind === "order" ? products.find((product) => product.id === item.order.productId) : undefined}
                  onShip={setShipOrder}
                  onTrack={setTrackOrder}
                />
              </li>
            ))}
          </ul>
          <InfiniteSentinel active={hasMore} sentinelRef={sentinelRef} />
        </>
      )}

      {shipOrder ? <ShipDialog order={shipOrder} onClose={() => setShipOrder(null)} onSave={saveTracking} /> : null}
      {trackOrder ? <TrackDialog order={trackOrder} onClose={() => setTrackOrder(null)} /> : null}
    </>
  );
}

function collectItems(filter: SaleFilter, orders: Order[]): DeskItem[] {
  const all: DeskItem[] = orders
    .filter((order) => order.role === "sale")
    .map((order) => ({ key: `order-${order.id}`, kind: "order" as const, order }));
  if (filter === "ALL") return all;
  return all.filter((item) => orderPhase(item.order.status) === filter);
}

function emptyLabel(filter: SaleFilter) {
  if (filter === "OPEN") return "진행 중인 거래가 없어요.";
  if (filter === "DONE") return "완료된 거래가 없어요.";
  if (filter === "CANCELLED") return "취소된 거래가 없어요.";
  return "판매 내역이 없어요.";
}

function DeskCard({
  item,
  product,
  vip,
  onShip,
  onTrack,
}: {
  item: DeskItem;
  product?: Product;
  vip: boolean;
  onShip: (order: Order) => void;
  onTrack: (order: Order) => void;
}) {
  const order = item.order;
  const title = order.title;
  const imageUrl = order.imageUrl ?? product?.imageUrl;
  const motif = order.motif;
  const palette = order.palette;
  const uid = order.id;
  const badge = order.status;
  const price = order.price;
  const money = settlementOf(order.itemPrice ?? order.price, vip);
  const payout = order.payoutAmount ?? money.payoutAmount;
  const settlement = settlementState(order.status);
  const href = `/orders/${order.id}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-400">
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-900"
      />
      <ProductVisual motif={motif} palette={palette} uid={uid} imageUrl={imageUrl} alt="" className="aspect-square w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE[badge] ?? "bg-slate-100 text-slate-600"}`}>{badge}</span>
        <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900 group-hover:underline">{title}</h2>
        <p className="text-sm font-semibold tabular-nums text-slate-900">{formatPrice(price)}</p>
        <p className="text-xs leading-5 text-slate-500">
          구매자 {order.counterpart} · {settlement} {formatPrice(payout)}
        </p>
        <CardActions item={item} onShip={onShip} onTrack={onTrack} />
      </div>
    </article>
  );
}

function CardActions({
  item,
  onShip,
  onTrack,
}: {
  item: DeskItem;
  onShip: (order: Order) => void;
  onTrack: (order: Order) => void;
}) {
  if (item.order.status === "결제완료") {
    return (
      <div className="relative z-20 mt-auto pt-1">
        <button type="button" onClick={() => onShip(item.order)} className={`${miniPrimary} w-full`}>운송장 등록</button>
      </div>
    );
  }
  if (item.order.status === "배송중") {
    return (
      <div className="relative z-20 mt-auto pt-1">
        <button type="button" onClick={() => onTrack(item.order)} className={`${miniGhost} w-full`}>배송 조회</button>
      </div>
    );
  }
  return null;
}

function ShipDialog({ order, onClose, onSave }: { order: Order; onClose: () => void; onSave: (tracking: string) => void }) {
  const [tracking, setTracking] = useState(order.tracking ?? "");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={onClose}>
      <form
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!tracking.trim()) return;
          onSave(tracking.trim());
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">운송장 등록</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{order.title}</p>
        <label className="mt-4 block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">운송장 번호</span>
          <input value={tracking} onChange={(event) => setTracking(event.target.value)} className={fieldClass} placeholder="운송장 번호" />
        </label>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className={`${ghostButtonClass} flex-1`}>닫기</button>
          <button type="submit" disabled={!tracking.trim()} className={`${primaryButtonClass} flex-1`}>저장</button>
        </div>
      </form>
    </div>
  );
}

function TrackDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const delivered = order.status === "배송완료" || order.status === "구매확정";
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="track-sale-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 id="track-sale-title" className="text-lg font-semibold text-slate-900">배송 조회</h2>
        <p className="mt-2 text-sm text-slate-500">{order.tracking ? `운송장 ${order.tracking}` : "등록된 운송장이 없어요."}</p>
        <ol className="mt-4 space-y-2 text-sm text-slate-500">
          <li>결제완료 · 주문을 확인했어요</li>
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
