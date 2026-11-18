"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  formatPrice,
  getSeller,
  orderMedia,
  viewCountOf,
  wishCountOf,
  type ChatRoom,
  type Product,
  type ProductMedia,
  type PurchaseStatus,
} from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { DeleteProductButton } from "@/components/spark/SellForm";
import { SaleStatusMenu } from "@/components/spark/SaleStatusMenu";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { ReportButton } from "@/components/spark/ReportDialog";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { roomInInbox } from "@/features/chat/rooms";
import { useI18n } from "@/features/i18n/useI18n";
import type { UiKey } from "@/features/i18n/ui";
import { saleStatusLabel } from "@/features/trade/productGuards";
import { useShared } from "@/data/shared";

export function ProductDetailView({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const mounted = useMounted();
  const { t } = useI18n();
  const { products, user, wishlistIds, toggleWishlist, ensureRoom, startPurchase, rooms, isProductDeleted, tradeRole, updateProduct, notify } = useSpark();
  const sharedReviews = useShared().reviews;
  const deleted = mounted && isProductDeleted(id);
  const live = products.find((product) => product.id === id);
  const sellerReviews = sharedReviews.filter((review) => review.sellerId === (live ?? initialProduct)?.sellerId && !review.deletedAt);
  const product = deleted ? undefined : mounted ? (live ?? initialProduct) : initialProduct;
  const productId = product?.id ?? id;
  const inquiryRooms = useMemo(
    () =>
      rooms
        .filter((room) => room.productId === productId && roomInInbox(room))
        .slice()
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")),
    [rooms, productId],
  );

  if (!initialProduct && !mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">상품을 찾을 수 없어요</h1>
        <Link href="/" className={`${ghostButtonClass} mt-6`}>
          홈으로
        </Link>
      </div>
    );
  }

  const seller = getSeller(product.sellerId);
  const sellerName = seller.id === "me" && user ? user.name : seller.name;
  const wished = mounted && wishlistIds.includes(product.id);
  const mine = product.sellerId === "me";
  const sold = product.saleStatus === "판매완료";
  const reserved = product.saleStatus === "예약중";
  const actingAsBuyer = tradeRole === "buyer";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <ProductGallery key={product.id} product={product} />

      <div className="flex flex-col">
        <p className="text-xs tracking-wide text-slate-400">
          {[product.category, product.country].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {mine ? (
            <SaleStatusMenu
              status={product.saleStatus}
              onChange={(next) => {
                const updated = updateProduct(product.id, { saleStatus: next });
                if (updated) notify(`판매 상태를 ${saleStatusLabel(next)} 바꿨어요. 가격과 내용을 이어서 수정할 수 있어요.`);
              }}
            />
          ) : (
            <SaleStatusText status={product.saleStatus} />
          )}
          <span className="text-xs text-slate-400">{product.postedLabel}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{product.title}</h1>
        <p className={`mt-4 text-3xl font-semibold tabular-nums tracking-tight ${sold ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {formatPrice(product.price)}
        </p>
        <p className="mt-2 text-sm text-slate-500">{shippingLabel(product)} · {product.location}</p>
        <p className="mt-6 text-sm leading-7 text-slate-600">{product.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Info label="조회수" value={viewCountOf(product).toLocaleString("en-US")} />
          <Info label="찜 수" value={wishCountOf(product, wished).toLocaleString("en-US")} />
        </dl>

        {!mine ? (
          <Link
            href={`/sellers/${seller.id}`}
            className="mt-6 block rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                {sellerName.slice(0, 1)}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900">{sellerName}</p>
                <p className="text-xs text-slate-400">
                  {seller.handle} · 평점 {seller.rating.toFixed(1)} · 거래 {seller.sales} · 후기 {sellerReviews.length}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{seller.bio}</p>
            <p className="mt-2 text-xs text-slate-400">{seller.city} · 프로필 보기</p>
          </Link>
        ) : null}

        {reserved && !mine ? <p className="mt-4 text-sm text-amber-700">예약 중이에요. 판매자에게 먼저 메시지를 남겨 주세요.</p> : null}
        {sold ? <p className="mt-4 text-sm text-slate-400">판매가 완료된 매물이에요.</p> : null}

        {mine ? (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <h2 className="text-sm font-semibold text-slate-900">{t("sellerManage")}</h2>
              <p className="mt-1 text-xs text-slate-500">상태 변경, 수정, 삭제는 여기서 관리해요.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/sell/${product.id}`} className={primaryButtonClass}>{t("listingsEdit")}</Link>
                <DeleteProductButton product={product} onDeleted={() => router.push("/sellers/me")} />
              </div>
            </section>

            <SellerInquiryList rooms={inquiryRooms} />
          </>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                className={ghostButtonClass}
                onClick={() => {
                  const roomId = ensureRoom(product);
                  if (!roomId) return;
                  router.push(`/chat/${roomId}`);
                }}
              >
                1:1 채팅
              </button>
              {actingAsBuyer && !sold ? (
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={() => {
                    const roomId = startPurchase(product);
                    if (!roomId) return;
                    router.push(`/chat/${roomId}`);
                  }}
                >
                  구매신청하기
                </button>
              ) : null}
            </div>
            {actingAsBuyer && !sold ? (
              <p className="mt-3 text-xs leading-5 text-slate-400">
                구매신청은 채팅으로 전달됩니다. 상단에서 판매자 롤로 바꾸면 정산 계좌와 발송지를 확인한 뒤 승인할 수 있어요.
              </p>
            ) : null}
            <div className="mt-3 flex gap-4">
              <button type="button" onClick={() => toggleWishlist(product.id)} className="text-sm text-slate-500 underline-offset-4 hover:underline">
                {wished ? "찜 해제" : "찜하기"}
              </button>
              <ReportButton targetType="상품" targetId={product.id} targetLabel={product.title} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SellerInquiryList({ rooms }: { rooms: ChatRoom[] }) {
  const { t } = useI18n();

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{t("sellerInquiryList")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("sellerInquiryHint")}</p>
        </div>
        <p className="text-xs tabular-nums text-slate-400">{rooms.length}</p>
      </div>

      {rooms.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
          {t("sellerInquiryEmpty")}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rooms.map((room) => {
            const buyer = room.buyerName || room.sellerName;
            const last = lastVisibleMessage(room);
            const status = purchaseLabel(room.purchase?.status, t);
            return (
              <li key={room.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                    {buyer.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{buyer}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.tone}`}>{status.label}</span>
                      {room.unread > 0 ? (
                        <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white">{room.unread}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{last?.text || "—"}</p>
                    <p className="mt-1 text-xs text-slate-400">{last?.at || room.updatedAt?.slice(11, 16) || ""}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link href={`/chat/${room.id}`} className={ghostButtonClass}>
                    {t("sellerChatGo")}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function lastVisibleMessage(room: ChatRoom) {
  for (let index = room.messages.length - 1; index >= 0; index -= 1) {
    const message = room.messages[index];
    if (!message) continue;
    if (message.sender === "system" && !message.text) continue;
    return message;
  }
  return null;
}

function purchaseLabel(status: PurchaseStatus | undefined, t: (key: UiKey) => string) {
  if (status === "대기") return { label: t("tradeStatusWaiting"), tone: "bg-rose-50 text-rose-700" };
  if (status === "승인") return { label: t("tradeStatusApproved"), tone: "bg-sky-50 text-sky-700" };
  if (status === "결제완료") return { label: t("tradeStatusPaid"), tone: "bg-emerald-50 text-emerald-700" };
  if (status === "거절") return { label: t("tradeStatusRejected"), tone: "bg-zinc-100 text-zinc-500" };
  return { label: t("tradeStatusInquiry"), tone: "bg-slate-100 text-slate-600" };
}

function galleryMedia(product: Product): ProductMedia[] {
  if (product.media && product.media.length > 0) return orderMedia(product.media);
  if (product.imageUrl) {
    return [{ id: `${product.id}-cover`, name: product.title, kind: "image", url: product.imageUrl, displayOrder: 0, thumbnailed: true }];
  }
  return [];
}

function ProductGallery({ product }: { product: Product }) {
  const items = galleryMedia(product);
  const [index, setIndex] = useState(0);
  const current = items[index] ?? items[0];

  return (
    <div>
      {current?.kind === "video" ? (
        <video src={current.url} controls className="aspect-square w-full rounded-2xl bg-slate-900 object-cover" />
      ) : (
        <ProductVisual
          motif={product.motif}
          palette={product.palette}
          uid={`detail-${product.id}-${current?.id ?? "empty"}`}
          imageUrl={current?.url ?? product.imageUrl}
          alt={product.title}
          className="aspect-square rounded-2xl"
        />
      )}
      {items.length > 0 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="사진 목록">
          {items.map((item, itemIndex) => {
            const selected = item.id === current?.id;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  aria-label={`${item.kind === "video" ? "동영상" : "사진"} 순서 ${item.displayOrder ?? itemIndex}`}
                  onClick={() => setIndex(itemIndex)}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100 ${selected ? "ring-2 ring-slate-900" : "ring-1 ring-slate-200"}`}
                >
                  {item.kind === "video" ? (
                    <video src={item.url} muted className="h-full w-full object-cover" />
                  ) : (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  )}
                  {item.kind === "video" ? (
                    <span className="absolute bottom-1 left-1 rounded-full bg-slate-900/80 px-1.5 py-0.5 text-[10px] text-white">동영상</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function shippingLabel(product: Product) {
  if (product.shippingIncluded === true) return "배송비 포함";
  if (product.shippingIncluded === false) return "배송비 별도";
  return product.shippingFee === 0 ? "무료배송" : `배송비 ${formatPrice(product.shippingFee)}`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
