"use client";

import Link from "next/link";
import { formatPrice, type Product, type SaleStatus } from "@/data/mockData";
import { InfiniteSentinel, useInfiniteGrid } from "@/components/spark/GridPager";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { SaleStatusMenu } from "@/components/spark/SaleStatusMenu";
import { DeleteProductButton } from "@/components/spark/SellForm";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { useI18n } from "@/features/i18n/useI18n";
import { saleStatusLabel } from "@/features/trade/productGuards";

const miniGhost = "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700";

export function MyListingsView() {
  const mounted = useMounted();
  const { t } = useI18n();
  const { products, user, updateProduct, notify } = useSpark();
  const mine = mounted && user ? products.filter((product) => product.sellerId === "me") : [];
  const { visibleCount, hasMore, sentinelRef } = useInfiniteGrid(mine.length, mine.map((product) => product.id).join(","));
  const visible = mine.slice(0, visibleCount);

  function changeStatus(product: Product, next: SaleStatus) {
    const updated = updateProduct(product.id, { saleStatus: next });
    if (updated) notify(`판매 상태를 ${saleStatusLabel(next)} 바꿨어요.`);
  }

  if (!mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">LISTINGS</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t("listingsTitle")}</h1>
          <p className="mt-2 text-sm text-slate-500">{t("listingsLede")}</p>
        </div>
        <Link href="/sell" className={ghostButtonClass}>{t("listingsRegister")}</Link>
      </div>
      {!user ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          <Link href="/login" className="font-medium text-slate-900 underline">{t("listingsNeedLogin")}</Link>
        </p>
      ) : mine.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">{t("listingsEmpty")}</p>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((product) => (
              <li key={product.id}>
                <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <Link href={`/products/${product.id}`} aria-label={product.title} className="absolute inset-0 z-10 rounded-2xl" />
                  <ProductVisual motif={product.motif} palette={product.palette} uid={product.id} imageUrl={product.imageUrl} alt="" className="aspect-square w-full" />
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <div className="relative z-20 w-fit">
                      <SaleStatusMenu status={product.saleStatus} onChange={(next) => changeStatus(product, next)} />
                    </div>
                    <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{product.title}</h2>
                    <p className="text-sm font-semibold tabular-nums text-slate-900">{formatPrice(product.price)}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                    <div className="relative z-20 mt-auto flex flex-wrap gap-1.5 pt-1">
                      <Link href={`/sell/${product.id}`} className={miniGhost}>{t("listingsEdit")}</Link>
                      <DeleteProductButton product={product} variant="text" />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <InfiniteSentinel active={hasMore} sentinelRef={sentinelRef} />
        </>
      )}
    </div>
  );
}
