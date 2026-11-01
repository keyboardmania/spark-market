"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, getSeller, type Product } from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { ProductInquiry } from "@/components/spark/ChatScreen";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { DeleteProductButton } from "@/components/spark/SellForm";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function ProductDetailView({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const mounted = useMounted();
  const { products, user, wishlistIds, toggleWishlist, addToCart, ensureRoom, rooms, isProductDeleted } = useSpark();
  const deleted = mounted && isProductDeleted(id);
  const live = products.find((product) => product.id === id);
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
  const canBuy = product.saleStatus === "판매중" && product.price > 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <ProductVisual
        motif={product.motif}
        palette={product.palette}
        ip={product.ip}
        uid={`detail-${product.id}`}
        imageUrl={product.imageUrl}
        alt={product.title}
        className="aspect-square rounded-2xl"
      />

      <div className="flex flex-col">
        <p className="text-xs tracking-wide text-slate-400">
          {[product.ip, product.category, product.country].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SaleStatusText status={product.saleStatus} />
          <span className="text-xs text-slate-400">{product.postedLabel}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{product.title}</h1>
        <p className={`mt-4 text-3xl font-semibold tabular-nums tracking-tight ${sold ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {formatPrice(product.price)}
        </p>
        <p className="mt-2 text-sm text-slate-500">{product.shippingFee === 0 ? "무료배송" : `배송비 ${formatPrice(product.shippingFee)}`} · {product.location}</p>
        <p className="mt-6 text-sm leading-7 text-slate-600">{product.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <Info label="찜" value={`${product.likes + (wished ? 1 : 0)}`} />
          <Info label="거래 방식" value="Spark 안전결제" />
          <Info label="등록" value={product.postedLabel} />
        </dl>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              {sellerName.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">{sellerName}</p>
              <p className="text-xs text-slate-400">
                {seller.handle} · 평점 {seller.rating.toFixed(1)} · 거래 {seller.sales}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{seller.bio}</p>
          <p className="mt-2 text-xs text-slate-400">{seller.city}</p>
        </section>

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

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <button type="button" className={ghostButtonClass} disabled={sold} onClick={() => addToCart(product.id)}>
            장바구니 담기
          </button>
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
                router.push(`/chat/${roomId}`);
              }}
            >
              1:1 채팅
            </button>
          )}
          <button
            type="button"
            className={primaryButtonClass}
            disabled={!canBuy}
            onClick={() => router.push(`/checkout/${product.id}`)}
          >
            구매하기
          </button>
        </div>
        <button type="button" onClick={() => toggleWishlist(product.id)} className="mt-3 self-start text-sm text-slate-500 underline-offset-4 hover:underline">
          {wished ? "찜 해제" : "찜하기"}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/80 px-4 py-3">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
