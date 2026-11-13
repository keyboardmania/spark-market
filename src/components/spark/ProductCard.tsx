"use client";

import Link from "next/link";
import { formatPrice, wishCountOf, type Product } from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function ProductCard({ product, linked = true, meta }: { product: Product; linked?: boolean; meta?: string }) {
  const { wishlistIds, toggleWishlist } = useSpark();
  const mounted = useMounted();
  const wished = mounted && wishlistIds.includes(product.id);
  const wishCount = wishCountOf(product, wished);
  const sold = product.saleStatus === "판매완료";
  const media = (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
      <ProductVisual
        motif={product.motif}
        palette={product.palette}
        uid={product.id}
        imageUrl={product.imageUrl}
        alt={product.title}
        className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
      />
    </div>
  );

  const copy = (
    <div className="flex flex-1 flex-col gap-1 px-1 py-3">
      <p className="text-[11px] tracking-wide text-slate-400">
        {meta ?? [product.category, product.country].filter(Boolean).join(" · ")}
      </p>
      <h2 className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">{product.title}</h2>
      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <p className={`text-base font-semibold tabular-nums tracking-tight ${sold ? "text-slate-400 line-through" : "text-slate-900"}`}>
          {formatPrice(product.price)}
        </p>
        <SaleStatusText status={product.saleStatus} />
      </div>
    </div>
  );

  return (
    <article className="group relative h-full">
      {linked ? (
        <Link href={`/products/${product.id}`} className="flex h-full flex-col">
          {media}
          {copy}
        </Link>
      ) : (
        <div className="flex h-full flex-col">
          {media}
          {copy}
        </div>
      )}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-white/90 py-0.5 pl-2 pr-0.5 text-slate-700 shadow-sm">
        <span className="min-w-4 text-xs font-semibold tabular-nums" aria-label={`찜 수 ${wishCount}`}>
          {wishCount.toLocaleString("en-US")}
        </span>
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? "찜 해제" : "찜하기"}
          onClick={() => toggleWishlist(product.id)}
          className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white"
        >
          <HeartIcon filled={wished} />
        </button>
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-rose-400 text-rose-400" : "fill-none text-slate-700"}`} aria-hidden>
      <path
        d="M12 20s-7-4.4-7-9.1C5 8 6.8 6.4 9 6.4c1.3 0 2.4.6 3 1.6.6-1 1.7-1.6 3-1.6 2.2 0 4 1.6 4 4.5C19 15.6 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
