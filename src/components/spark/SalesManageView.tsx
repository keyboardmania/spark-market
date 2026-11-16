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
import { GRID_PAGE_SIZE, GridPager } from "@/components/spark/GridPager";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { SaleStatusMenu } from "@/components/spark/SaleStatusMenu";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { saleStatusLabel } from "@/features/trade/productGuards";

const FILTERS = [
  { id: "ALL", label: "전체" },
  { id: "ON_SALE", label: "판매중" },
  { id: "RESERVED", label: "예약중" },
  { id: "SOLD", label: "판매완료" },
  { id: "REQUEST", label: "수락 대기" },
  { id: "SHIPPING", label: "배송/진행" },
  { id: "SETTLED", label: "정산" },
  { id: "CANCELLED", label: "거래취소" },
] as const;

type SaleFilter = (typeof FILTERS)[number]["id"];

type DeskItem =
  | { key: string; kind: "request"; roomId: string; product: Product; buyer: string }
  | { key: string; kind: "order"; order: Order }
  | { key: string; kind: "listing"; product: Product };

const LISTING_STATUS: Partial<Record<SaleFilter, SaleStatus>> = {
  ON_SALE: "판매중",
  RESERVED: "예약중",
  SOLD: "판매완료",
};

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
  if (value === "OPEN") return "SHIPPING";
  if (value === "DONE") return "SETTLED";
  const match = FILTERS.find((item) => item.id === value);
  return match?.id ?? "ALL";
}

function orderBucket(status: OrderStatus): SaleFilter {
  if (status === "구매확정") return "SETTLED";
  if (status === "거래취소") return "CANCELLED";
  return "SHIPPING";
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
  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const pageCount = Math.max(1, Math.ceil(items.length / GRID_PAGE_SIZE));
  const page = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), pageCount);
  const visible = items.slice((page - 1) * GRID_PAGE_SIZE, page * GRID_PAGE_SIZE);

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

  function selectPage(next: number) {
    const params = new URLSearchParams();
    params.set("tab", "sale");
    if (filter !== "ALL") params.set("filter", filter);
    if (next > 1) params.set("page", String(next));
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">ORDERS</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">구매/판매 내역</h1>
          <p className="mt-2 text-sm text-slate-500">판매 상품과 주문을 한 목록에서 봅니다. 수락·거절, 배송, 정산까지 여기서 처리해요.</p>
        </div>
        <Link href="/sell" className={ghostButtonClass}>상품 등록</Link>
      </div>

      <div className="mt-6 flex gap-2" role="tablist" aria-label="내역 구분">
        <button type="button" role="tab" aria-selected={false} onClick={() => router.replace("/orders?tab=buy", { scroll: false })} className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-500">
          구매 내역
        </button>
        <button type="button" role="tab" aria-selected className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          판매 내역
        </button>
      </div>

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
                  onDeliver={(order) => {
                    updateOrder(order.id, { status: "배송완료" });
                    notify("배송완료로 바꿨어요. 구매확정 전까지 정산은 대기입니다.");
                  }}
                />
              </li>
            ))}
          </ul>
          <GridPager page={page} pageCount={pageCount} total={items.length} onPage={selectPage} label="판매 내역 페이지" />
        </>
      )}

      {acceptRoomId ? <AcceptDialog roomId={acceptRoomId} onClose={() => setAcceptRoomId(null)} /> : null}
      {shipOrder ? <ShipDialog order={shipOrder} onClose={() => setShipOrder(null)} onSave={saveTracking} /> : null}
      {trackOrder ? <TrackDialog order={trackOrder} onClose={() => setTrackOrder(null)} /> : null}
    </div>
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
  const listingStatus = LISTING_STATUS[filter];
  if (listingStatus) {
    return products
      .filter((product) => product.sellerId === "me" && product.saleStatus === listingStatus)
      .map((product) => ({ key: `listing-${product.id}`, kind: "listing" as const, product }));
  }
  if (filter === "REQUEST") return requests;
  if (filter === "SHIPPING" || filter === "SETTLED" || filter === "CANCELLED") {
    return saleOrders
      .filter((order) => orderBucket(order.status) === filter)
      .map((order) => ({ key: `order-${order.id}`, kind: "order" as const, order }));
  }
  const busy = new Set<string>([
    ...requests.flatMap((item) => (item.kind === "request" ? [item.product.id] : [])),
    ...saleOrders.filter((order) => order.status !== "구매확정" && order.status !== "거래취소").map((order) => order.productId),
  ]);
  const listings: DeskItem[] = products
    .filter((product) => product.sellerId === "me" && !busy.has(product.id))
    .map((product) => ({ key: `listing-${product.id}`, kind: "listing" as const, product }));
  return [
    ...requests,
    ...saleOrders.map((order) => ({ key: `order-${order.id}`, kind: "order" as const, order })),
    ...listings,
  ];
}

function emptyLabel(filter: SaleFilter) {
  if (filter === "ON_SALE") return "판매중인 상품이 없어요.";
  if (filter === "RESERVED") return "예약중인 상품이 없어요.";
  if (filter === "SOLD") return "판매완료된 상품이 없어요.";
  if (filter === "REQUEST") return "수락을 기다리는 구매 신청이 없어요.";
  if (filter === "SHIPPING") return "배송이 진행 중인 주문이 없어요.";
  if (filter === "SETTLED") return "정산할 구매확정 주문이 없어요.";
  if (filter === "CANCELLED") return "거래취소된 주문이 없어요.";
  return "판매 내역이 없어요.";
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
  onDeliver,
}: {
  item: DeskItem;
  product?: Product;
  vip: boolean;
  onAccept: (roomId: string) => void;
  onReject: (roomId: string) => void;
  onStatus: (product: Product, status: SaleStatus) => void;
  onShip: (order: Order) => void;
  onTrack: (order: Order) => void;
  onDeliver: (order: Order) => void;
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

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ProductVisual motif={motif} palette={palette} uid={uid} imageUrl={imageUrl} alt="" className="aspect-square w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        {item.kind === "listing" ? (
          <SaleStatusMenu status={item.product.saleStatus} onChange={(next) => onStatus(item.product, next)} />
        ) : (
          <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE[badge] ?? "bg-slate-100 text-slate-600"}`}>{badge}</span>
        )}
        <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{title}</h2>
        <p className="text-sm font-semibold tabular-nums text-slate-900">{formatPrice(price)}</p>
        {item.kind === "request" ? <p className="text-xs text-slate-500">구매자 {item.buyer}</p> : null}
        {order ? (
          <p className="text-xs leading-5 text-slate-500">
            구매자 {order.counterpart}
            {settlement ? ` · ${settlement} ${formatPrice(payout)}` : ""}
          </p>
        ) : null}
        {item.kind === "listing" ? <p className="text-xs text-slate-500">{item.product.category}</p> : null}
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          {item.kind === "request" ? (
            <>
              <button type="button" onClick={() => onReject(item.roomId)} className={miniGhost}>거절</button>
              <button type="button" onClick={() => onAccept(item.roomId)} className={miniPrimary}>수락</button>
            </>
          ) : null}
          {item.kind === "listing" ? (
            <>
              <Link href={`/sell/${item.product.id}`} className={miniGhost}>수정</Link>
              <Link href={`/products/${item.product.id}`} className={miniGhost}>상세</Link>
            </>
          ) : null}
          {order && (order.status === "결제완료" || order.status === "배송중") ? (
            <button type="button" onClick={() => onShip(order)} className={miniPrimary}>{order.tracking ? "운송장 수정" : "운송장 등록"}</button>
          ) : null}
          {order?.tracking && order.status !== "거래취소" ? (
            <button type="button" onClick={() => onTrack(order)} className={miniGhost}>배송 조회</button>
          ) : null}
          {order?.status === "배송중" ? (
            <button type="button" onClick={() => onDeliver(order)} className={miniGhost}>배송완료</button>
          ) : null}
          {order ? <Link href={`/orders/${order.id}`} className={miniGhost}>주문 상세</Link> : null}
        </div>
      </div>
    </article>
  );
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
        <p className="mt-2 text-sm text-slate-500">운송장 {order.tracking}</p>
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
