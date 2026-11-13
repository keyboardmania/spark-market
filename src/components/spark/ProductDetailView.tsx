"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice, getSeller, orderMedia, viewCountOf, wishCountOf, type Product, type ProductMedia } from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { ProductInquiry } from "@/components/spark/ChatScreen";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { DeleteProductButton } from "@/components/spark/SellForm";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { ReportButton } from "@/components/spark/ReportDialog";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { useShared } from "@/data/shared";

export function ProductDetailView({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const mounted = useMounted();
  const { products, user, wishlistIds, toggleWishlist, ensureRoom, startPurchase, rooms, isProductDeleted } = useSpark();
  const sharedReviews = useShared().reviews;
  const deleted = mounted && isProductDeleted(id);
  const live = products.find((product) => product.id === id);
  const sellerReviews = sharedReviews.filter((review) => review.sellerId === (live ?? initialProduct)?.sellerId && !review.deletedAt);
  const product = deleted ? undefined : mounted ? (live ?? initialProduct) : initialProduct;

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
  const saleRoom = mine ? rooms.find((room) => room.productId === product.id) : undefined;
  const sold = product.saleStatus === "판매완료";
  const reserved = product.saleStatus === "예약중";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <ProductGallery key={product.id} product={product} />

      <div className="flex flex-col">
        <p className="text-xs tracking-wide text-slate-400">
          {[product.category, product.country].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SaleStatusText status={product.saleStatus} />
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

        {mine && saleRoom?.messages.some((message) => message.originalText && message.translatedText) ? (
          <div className="mt-6">
            <ProductInquiry productId={product.id} />
          </div>
        ) : null}

        {reserved ? <p className="mt-4 text-sm text-amber-700">예약 중이에요. 판매자에게 먼저 메시지를 남겨 주세요.</p> : null}
        {sold ? <p className="mt-4 text-sm text-slate-400">판매가 완료된 매물이에요.</p> : null}
        {product.sellerId === "me" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/sell/${product.id}`} className={ghostButtonClass}>수정</Link>
            <DeleteProductButton product={product} onDeleted={() => router.push("/")} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {mine && saleRoom ? (
            <Link href={`/chat/${saleRoom.id}`} className={ghostButtonClass}>
              구매자 채팅
            </Link>
          ) : (
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
          )}
          {mine || sold ? null : (
            <button
              type="button"
              className={primaryButtonClass}
              onClick={() => {
                const roomId = startPurchase(product);
                if (!roomId) return;
                router.push(`/chat/${roomId}`);
              }}
            >
              구매하기
            </button>
          )}
        </div>
        {mine || sold ? null : (
          <p className="mt-3 text-xs leading-5 text-slate-400">
            구매하기를 누르면 채팅이 열립니다. 판매중인 상품은 판매자에게 수락 요청이 전송되고, 수락되면 그 채팅에서 결제합니다.
          </p>
        )}
        <div className="mt-3 flex gap-4">
          <button type="button" onClick={() => toggleWishlist(product.id)} className="text-sm text-slate-500 underline-offset-4 hover:underline">
            {wished ? "찜 해제" : "찜하기"}
          </button>
          <ReportButton targetType="상품" targetId={product.id} targetLabel={product.title} />
        </div>
      </div>
    </div>
  );
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
