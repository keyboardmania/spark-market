"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AccountPicker } from "@/features/seller-payout/AccountPicker";
import { AddressPicker } from "@/features/seller-payout/AddressPicker";
import { PayoutSummary } from "@/features/seller-payout/PayoutSummary";
import { useSellerPayout } from "@/features/seller-payout/useSellerPayout";
import {
  formatPrice,
  settlementOf,
  type Order,
  type OrderStatus,
  type Product,
  type SaleStatus,
} from "@/data/mockData";
import { InfiniteSentinel, useInfiniteGrid } from "@/components/spark/GridPager";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { SaleStatusMenu } from "@/components/spark/SaleStatusMenu";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { saleStatusLabel } from "@/features/trade/productGuards";

const FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "OPEN", label: "거래 진행 중" },
  { id: "DONE", label: "거래 완료/정산" },
  { id: "CANCELLED", label: "거래 취소" },
] as const;

type SaleFilter = (typeof FILTERS)[number]["id"];

type DeskItem =
  | { key: string; kind: "request"; roomId: string; product: Product; buyer: string }
  | { key: string; kind: "order"; order: Order }
  | { key: string; kind: "listing"; product: Product };

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
  const { products, orders, rooms, user, updateOrder, updateProduct, decidePurchase, notify } = useSpark();
  const [acceptRoomId, setAcceptRoomId] = useState<string | null>(null);
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);
  const filter = parseFilter(searchParams.get("filter") ?? searchParams.get("status"));
  const vip = user?.membership === "vip";

  const items = mounted ? collectItems(filter, products, orders, rooms) : [];
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
                  onAccept={setAcceptRoomId}
                  onReject={(roomId) => decidePurchase(roomId, false)}
                  onStatus={(product, next) => {
                    const updated = updateProduct(product.id, { saleStatus: next });
                    if (updated) notify(`판매 상태를 ${saleStatusLabel(next)} 바꿨어요. 가격과 내용을 이어서 수정할 수 있어요.`);
                  }}
                  onShip={setShipOrder}
                  onTrack={setTrackOrder}
                />
              </li>
            ))}
          </ul>
          <InfiniteSentinel active={hasMore} sentinelRef={sentinelRef} />
        </>
      )}

      {acceptRoomId ? <AcceptDialog roomId={acceptRoomId} onClose={() => setAcceptRoomId(null)} /> : null}
      {shipOrder ? <ShipDialog order={shipOrder} onClose={() => setShipOrder(null)} onSave={saveTracking} /> : null}
      {trackOrder ? <TrackDialog order={trackOrder} onClose={() => setTrackOrder(null)} /> : null}
    </>
  );
}

function collectItems(
  filter: SaleFilter,
  products: Product[],
  orders: Order[],
  rooms: { id: string; productId: string; buyerName?: string; sellerName: string; purchase?: { status: string } }[],
): DeskItem[] {
  const requests: DeskItem[] = rooms.flatMap((room) => {
    const product = products.find((item) => item.id === room.productId && item.sellerId === "me");
    if (!product || room.purchase?.status !== "대기") return [];
    return [{ key: `request-${room.id}`, kind: "request" as const, roomId: room.id, product, buyer: room.buyerName || room.sellerName }];
  });
  const saleOrders = orders.filter((order) => order.role === "sale");
  const busy = new Set<string>([
    ...requests.flatMap((item) => (item.kind === "request" ? [item.product.id] : [])),
    ...saleOrders.filter((order) => order.status !== "구매확정" && order.status !== "거래취소").map((order) => order.productId),
  ]);
  const listings: DeskItem[] = products
    .filter((product) => product.sellerId === "me" && !busy.has(product.id))
    .map((product) => ({ key: `listing-${product.id}`, kind: "listing" as const, product }));
  const all: DeskItem[] = [
    ...requests,
    ...saleOrders.map((order) => ({ key: `order-${order.id}`, kind: "order" as const, order })),
    ...listings,
  ];
  if (filter === "ALL") return all;
  return all.filter((item) => itemPhase(item) === filter);
}

function itemPhase(item: DeskItem): SaleFilter | "LISTING" {
  if (item.kind === "request") return "OPEN";
  if (item.kind === "order") return orderPhase(item.order.status);
  if (item.product.saleStatus === "판매완료") return "DONE";
  return "LISTING";
}

function emptyLabel(filter: SaleFilter) {
  if (filter === "OPEN") return "진행 중인 거래가 없어요.";
  if (filter === "DONE") return "완료되거나 정산된 거래가 없어요.";
  if (filter === "CANCELLED") return "취소된 거래가 없어요.";
  return "판매 내역이 없어요.";
}

function cardHref(item: DeskItem) {
  if (item.kind === "order") return `/orders/${item.order.id}`;
  if (item.kind === "request") return `/chat/${item.roomId}`;
  return `/sell/${item.product.id}`;
}

function DeskCard({
  item,
  product,
  vip,
  onAccept,
  onReject,
  onStatus,
  onShip,
  onTrack,
}: {
  item: DeskItem;
  product?: Product;
  vip: boolean;
  onAccept: (roomId: string) => void;
  onReject: (roomId: string) => void;
  onStatus: (product: Product, status: SaleStatus) => void;
  onShip: (order: Order) => void;
  onTrack: (order: Order) => void;
}) {
  const order = item.kind === "order" ? item.order : null;
  const title = item.kind === "order" ? item.order.title : item.product.title;
  const imageUrl = item.kind === "order" ? item.order.imageUrl ?? product?.imageUrl : item.product.imageUrl;
  const motif = item.kind === "order" ? item.order.motif : item.product.motif;
  const palette = item.kind === "order" ? item.order.palette : item.product.palette;
  const uid = item.kind === "order" ? item.order.id : item.product.id;
  const badge = item.kind === "order" ? item.order.status : item.kind === "request" ? "수락 대기" : item.product.saleStatus;
  const price = item.kind === "order" ? item.order.price : item.product.price;
  const money = order ? settlementOf(order.itemPrice ?? order.price, vip) : null;
  const payout = order?.payoutAmount ?? money?.payoutAmount ?? 0;
  const settlement = order ? settlementState(order.status) : null;
  const href = cardHref(item);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-400">
      <Link
        href={href}
        aria-label={title}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-slate-900"
      />
      <ProductVisual motif={motif} palette={palette} uid={uid} imageUrl={imageUrl} alt="" className="aspect-square w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        {item.kind === "listing" ? (
          <div className="relative z-20 w-fit">
            <SaleStatusMenu status={item.product.saleStatus} onChange={(next) => onStatus(item.product, next)} />
          </div>
        ) : (
          <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE[badge] ?? "bg-slate-100 text-slate-600"}`}>{badge}</span>
        )}
        <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900 group-hover:underline">{title}</h2>
        <p className="text-sm font-semibold tabular-nums text-slate-900">{formatPrice(price)}</p>
        {item.kind === "request" ? <p className="text-xs text-slate-500">구매자 {item.buyer}</p> : null}
        {order ? (
          <p className="text-xs leading-5 text-slate-500">
            구매자 {order.counterpart}
            {settlement ? ` · ${settlement} ${formatPrice(payout)}` : ""}
          </p>
        ) : null}
        {item.kind === "listing" ? <p className="text-xs text-slate-500">{item.product.category}</p> : null}
        <CardActions item={item} onAccept={onAccept} onReject={onReject} onShip={onShip} onTrack={onTrack} />
      </div>
    </article>
  );
}

function CardActions({
  item,
  onAccept,
  onReject,
  onShip,
  onTrack,
}: {
  item: DeskItem;
  onAccept: (roomId: string) => void;
  onReject: (roomId: string) => void;
  onShip: (order: Order) => void;
  onTrack: (order: Order) => void;
}) {
  if (item.kind === "request") {
    return (
      <div className="relative z-20 mt-auto grid grid-cols-2 gap-1.5 pt-1">
        <button type="button" onClick={() => onReject(item.roomId)} className={miniGhost}>거절</button>
        <button type="button" onClick={() => onAccept(item.roomId)} className={miniPrimary}>수락</button>
      </div>
    );
  }
  if (item.kind === "order" && item.order.status === "결제완료") {
    return (
      <div className="relative z-20 mt-auto pt-1">
        <button type="button" onClick={() => onShip(item.order)} className={`${miniPrimary} w-full`}>운송장 등록</button>
      </div>
    );
  }
  if (item.kind === "order" && item.order.status === "배송중") {
    return (
      <div className="relative z-20 mt-auto pt-1">
        <button type="button" onClick={() => onTrack(item.order)} className={`${miniGhost} w-full`}>배송 조회</button>
      </div>
    );
  }
  return null;
}

function AcceptDialog({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const payout = useSellerPayout(roomId);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="accept-sale-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <h2 id="accept-sale-title" className="text-lg font-semibold text-slate-900">구매 수락</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">정산 계좌를 확인한 뒤 수락합니다. 거절한 상품은 판매중으로 남습니다.</p>
        {payout.product && payout.payout ? (
          <div className="mt-5 flex flex-col gap-4">
            <PayoutSummary product={payout.product} payout={payout.payout} />
            <AddressPicker addresses={payout.addresses} value={payout.addressId} onChange={payout.setAddressId} />
            <AccountPicker accounts={payout.banks} value={payout.accountId} onChange={payout.setAccountId} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">판매 상품을 찾을 수 없어요.</p>
        )}
        {!payout.isSeller ? <p className="mt-4 text-sm text-amber-800">상단에서 판매자 롤로 전환한 뒤 승인할 수 있어요.</p> : null}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className={`${ghostButtonClass} flex-1`}>닫기</button>
          <button
            type="button"
            disabled={!payout.addressId || !payout.accountId || !payout.isSeller}
            onClick={() => {
              payout.confirm();
              onClose();
            }}
            className={`${primaryButtonClass} flex-1`}
          >
            저장하고 수락
          </button>
        </div>
      </div>
    </div>
  );
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
