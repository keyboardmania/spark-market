"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  IP_FILTERS,
  PRODUCTS,
  categoryHref,
  formatPrice,
  type CategoryFilter,
  type IpFilter,
  type Product,
} from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const SORTS = [
  { id: "new", label: "최신순" },
  { id: "likes", label: "인기순" },
  { id: "priceAsc", label: "낮은 가격" },
  { id: "priceDesc", label: "높은 가격" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export function MarketView({ category }: { category: CategoryFilter }) {
  const { products } = useSpark();
  const mounted = useMounted();
  const [ip, setIp] = useState<IpFilter>("전체");
  const [sort, setSort] = useState<SortId>("new");
  const source = mounted ? products : PRODUCTS;

  const filtered = useMemo(() => {
    const next = source.filter((product) => {
      if (category !== "전체" && product.category !== category) return false;
      if (ip !== "전체" && product.ip !== ip) return false;
      return true;
    });
    return [...next].sort((a, b) => compareProducts(a, b, sort));
  }, [category, ip, sort, source]);

  const featured = ["pkmn-charizard-psa10", "chii-secret-plush", "sanrio-cinnamoroll"]
    .map((id) => source.find((product) => product.id === id))
    .filter((product) => product !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {category === "전체" ? (
        <section className="relative grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-rose-100/70 blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">PREMIUM C2C</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              좋아하는 것을,
              <span className="mt-1 block font-serif text-[2.6rem] font-medium italic leading-none text-slate-800 sm:text-6xl">Spark.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
              하이큐!!, 블리치, 산리오, 포켓몬, 먼작귀. 하얀 선반 위에 매물을 올려 두었어요.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/sell" className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
                판매하기
              </Link>
              <Link href="/orders" className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700">
                거래 내역
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {featured.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="overflow-hidden rounded-2xl bg-slate-50">
                <ProductVisual
                  motif={product.motif}
                  palette={product.palette}
                  ip={product.ip}
                  uid={`feat-${product.id}`}
                  imageUrl={product.imageUrl}
                  alt={product.title}
                  className="aspect-[4/5]"
                />
                <div className="space-y-1 p-2.5">
                  <p className="line-clamp-2 text-[11px] leading-4 text-slate-600">{product.title}</p>
                  <p className="text-xs font-semibold tabular-nums text-slate-900">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CATEGORY</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{category}</h1>
          <p className="mt-2 text-sm text-slate-500">작품으로 한 번 더 골라 보세요.</p>
        </section>
      )}

      <section className="mt-10 space-y-4" aria-label="상품 목록">
        <FilterRow label="카테고리">
          <Link
            href="/"
            aria-current={category === "전체" ? "page" : undefined}
            className={pillClass(category === "전체")}
          >
            전체
          </Link>
          {(["TCG", "피규어", "산리오/굿즈"] as const).map((item) => (
            <Link key={item} href={categoryHref(item)} aria-current={category === item ? "page" : undefined} className={pillClass(category === item)}>
              {item}
            </Link>
          ))}
        </FilterRow>

        <FilterRow label="작품">
          {IP_FILTERS.map((item) => (
            <button key={item} type="button" aria-pressed={ip === item} onClick={() => setIp(item)} className={pillClass(ip === item)}>
              {item === "전체" ? "모든 작품" : item}
            </button>
          ))}
        </FilterRow>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-slate-500">
            {category === "전체" ? "전체" : category} · {filtered.length}개
          </p>
          <label className="flex items-center gap-2 text-sm text-slate-500">
            정렬
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortId)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
            >
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center text-sm text-slate-400">
            이 조건에 맞는 매물이 없어요.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function compareProducts(a: Product, b: Product, sort: SortId) {
  if (sort === "priceAsc") return a.price - b.price;
  if (sort === "priceDesc") return b.price - a.price;
  if (sort === "likes") return b.likes - a.likes;
  return b.postedOrder - a.postedOrder;
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <p className="hidden w-14 shrink-0 pt-2 text-xs text-slate-400 sm:block">{label}</p>
      <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
        {children}
      </div>
    </div>
  );
}

function pillClass(active: boolean) {
  return `shrink-0 rounded-full px-3.5 py-2 text-sm transition ${
    active ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
  }`;
}
