"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ORIGINS,
  PRODUCTS,
  SALE_STATUSES,
  formatPrice,
  viewCountOf,
  type CategoryFilter,
  type Origin,
  type Product,
  type SaleStatus,
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
type StatusFilter = "active" | SaleStatus;
const PAGE_SIZE = 25;

export function MarketView({ category }: { category: CategoryFilter }) {
  const { products } = useSpark();
  const mounted = useMounted();
  const [origin, setOrigin] = useState<Origin | "전체">("전체");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortId>("new");
  const [page, setPage] = useState(1);
  const source = mounted ? products : PRODUCTS;

  const filtered = useMemo(() => {
    const min = minPrice.trim() === "" ? null : Number(minPrice);
    const max = maxPrice.trim() === "" ? null : Number(maxPrice);
    const next = source.filter((product) => {
      if (category !== "전체" && product.category !== category) return false;
      if (origin !== "전체" && product.country !== origin) return false;
      if (status === "active" && product.saleStatus === "판매완료") return false;
      if (status !== "active" && product.saleStatus !== status) return false;
      if (min !== null && !Number.isNaN(min) && product.price < min) return false;
      if (max !== null && !Number.isNaN(max) && product.price > max) return false;
      return true;
    });
    return [...next].sort((a, b) => compareProducts(a, b, sort));
  }, [category, origin, status, minPrice, maxPrice, sort, source]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const featured = ["pkmn-charizard-psa10", "chii-secret-plush", "sanrio-cinnamoroll"]
    .map((id) => source.find((product) => product.id === id))
    .filter((product) => product !== undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {category === "전체" ? (
        <section className="relative grid items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(240px,340px)]">
          <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-rose-100/70 blur-3xl" />
          <div className="relative min-w-0">
            <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">PREMIUM C2C</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              좋아하는 것을,
              <span className="mt-1 block font-serif text-[2.6rem] font-medium italic leading-none text-slate-800 sm:text-6xl">Spark.</span>
            </h1>
            <p className="mt-5 whitespace-nowrap text-sm tracking-tight text-slate-500">
              당신의 취향이 머무는 곳.
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
          <p className="mt-2 text-sm leading-6 text-slate-500">국가, 판매 상태, 가격대로 골라 보세요.</p>
        </section>
      )}

      <section className="mt-12" aria-label="상품 목록">
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
          <FilterRow label="국가">
            <button type="button" aria-pressed={origin === "전체"} onClick={() => { setOrigin("전체"); setPage(1); }} className={pillClass(origin === "전체")}>
              전체
            </button>
            {ORIGINS.map((item) => (
              <button key={item} type="button" aria-pressed={origin === item} onClick={() => { setOrigin(item); setPage(1); }} className={pillClass(origin === item)}>
                {item}
              </button>
            ))}
          </FilterRow>

          <FilterRow label="판매 상태">
            <button type="button" aria-pressed={status === "active"} onClick={() => { setStatus("active"); setPage(1); }} className={pillClass(status === "active")}>
              판매중·예약중
            </button>
            {SALE_STATUSES.map((item) => (
              <button key={item} type="button" aria-pressed={status === item} onClick={() => { setStatus(item); setPage(1); }} className={pillClass(status === item)}>
                {item}
              </button>
            ))}
          </FilterRow>

          <div className="flex flex-wrap items-end gap-4 border-t border-slate-200/80 pt-5">
            <p className="w-full text-sm font-medium text-slate-700 sm:w-24">가격대</p>
            <label className="text-sm text-slate-600">
              최저 USD
              <input inputMode="numeric" value={minPrice} onChange={(event) => { setMinPrice(event.target.value.replace(/\D/g, "")); setPage(1); }} className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900" />
            </label>
            <label className="text-sm text-slate-600">
              최고 USD
              <input inputMode="numeric" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value.replace(/\D/g, "")); setPage(1); }} className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900" />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
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
          <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {visible.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
              <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} onClick={() => setPage(number)} className={pillClass(number === currentPage)}>
                {number}
              </button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function compareProducts(a: Product, b: Product, sort: SortId) {
  if (sort === "priceAsc") return a.price - b.price;
  if (sort === "priceDesc") return b.price - a.price;
  if (sort === "likes") {
    const byWish = b.likes - a.likes;
    if (byWish !== 0) return byWish;
    return viewCountOf(b) - viewCountOf(a);
  }
  return b.postedOrder - a.postedOrder;
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-24 shrink-0 text-sm font-medium text-slate-700">{label}</p>
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
