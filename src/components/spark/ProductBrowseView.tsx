"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  ORIGINS,
  PRODUCTS,
  SALE_STATUSES,
  compareByCreatedAt,
  compareByPopularity,
  type CategoryFilter,
  type Origin,
  type Product,
  type SaleStatus,
} from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export type ProductFeed = "popular" | "new";

const PAGE_SIZE = 25;

const FEEDS = {
  popular: {
    eyebrow: "POPULAR",
    title: "인기상품",
    lede: "찜이 많은 순이고, 같으면 조회수가 높은 순이에요.",
    href: "/products/popular",
  },
  new: {
    eyebrow: "NEW",
    title: "신상품",
    lede: "등록일이 최근인 순이에요.",
    href: "/products/new",
  },
} as const satisfies Record<ProductFeed, { eyebrow: string; title: string; lede: string; href: string }>;

export function productFeedHref(feed: ProductFeed) {
  return FEEDS[feed].href;
}

type StatusFilter = "active" | SaleStatus;

export function ProductBrowseView({ feed }: { feed: ProductFeed }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { products, wishlistIds } = useSpark();
  const mounted = useMounted();
  const wishedIds = useMemo(() => new Set(mounted ? wishlistIds : []), [mounted, wishlistIds]);
  const source = mounted ? products : PRODUCTS;
  const copy = FEEDS[feed];

  const [category, setCategory] = useState<CategoryFilter>("전체");
  const [origin, setOrigin] = useState<Origin | "전체">("전체");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showTop, setShowTop] = useState(false);
  const filterKeyRef = useRef("");

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
    const compare = feed === "popular" ? (a: Product, b: Product) => compareByPopularity(a, b, wishedIds) : compareByCreatedAt;
    return [...next].sort(compare);
  }, [category, origin, status, minPrice, maxPrice, source, feed, wishedIds]);

  const filterKey = `${feed}|${category}|${origin}|${status}|${minPrice}|${maxPrice}`;
  const requestedPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (filterKeyRef.current === filterKey) return;
    const previous = filterKeyRef.current;
    filterKeyRef.current = filterKey;
    if (!previous) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("page")) return;
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filterKey, pathname, router]);

  function openPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    document.getElementById("browse-grid")?.scrollIntoView({ block: "start" });
  }

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 480);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function openFeed(next: ProductFeed) {
    if (next === feed) return;
    router.push(productFeedHref(next));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{copy.eyebrow}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{copy.title}</h1>
          <div className="flex gap-2" role="group" aria-label="정렬">
            <button type="button" aria-pressed={feed === "popular"} onClick={() => openFeed("popular")} className={pillClass(feed === "popular")}>
              인기순
            </button>
            <button type="button" aria-pressed={feed === "new"} onClick={() => openFeed("new")} className={pillClass(feed === "new")}>
              최신순
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">{copy.lede}</p>
      </header>

      <div className="mt-8 space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
        <FilterRow label="카테고리">
          <button type="button" aria-pressed={category === "전체"} onClick={() => setCategory("전체")} className={pillClass(category === "전체")}>
            전체
          </button>
          {CATEGORIES.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={pillClass(category === item)}>
              {item}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="국가">
          <button type="button" aria-pressed={origin === "전체"} onClick={() => setOrigin("전체")} className={pillClass(origin === "전체")}>
            전체
          </button>
          {ORIGINS.map((item) => (
            <button key={item} type="button" aria-pressed={origin === item} onClick={() => setOrigin(item)} className={pillClass(origin === item)}>
              {item}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="판매 상태">
          <button type="button" aria-pressed={status === "active"} onClick={() => setStatus("active")} className={pillClass(status === "active")}>
            판매중·예약중
          </button>
          {SALE_STATUSES.map((item) => (
            <button key={item} type="button" aria-pressed={status === item} onClick={() => setStatus(item)} className={pillClass(status === item)}>
              {item}
            </button>
          ))}
        </FilterRow>
        <div className="flex flex-wrap items-end gap-4 border-t border-slate-200/80 pt-5">
          <p className="w-full text-sm font-medium text-slate-700 sm:w-24">가격대</p>
          <label className="text-sm text-slate-600">
            최저 USD
            <input
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))}
              className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900"
            />
          </label>
          <label className="text-sm text-slate-600">
            최고 USD
            <input
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))}
              className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900"
            />
          </label>
        </div>
      </div>

      <p id="browse-grid" className="mt-6 scroll-mt-24 text-sm text-slate-500">
        {category === "전체" ? "전체" : category} · {filtered.length}개 · {page} / {pageCount} 페이지
      </p>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center text-sm text-slate-400">
          이 조건에 맞는 매물이 없어요.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {pageCount > 1 ? (
        <nav aria-label="페이지" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => openPage(page - 1)} className={pageButtonClass(false)}>
            이전
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" aria-current={number === page ? "page" : undefined} onClick={() => openPage(number)} className={pageButtonClass(number === page)}>
              {number}
            </button>
          ))}
          <button type="button" disabled={page >= pageCount} onClick={() => openPage(page + 1)} className={pageButtonClass(false)}>
            다음
          </button>
        </nav>
      ) : null}

      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-30 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg sm:right-6"
        >
          맨 위로
        </button>
      ) : null}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-24 shrink-0 text-sm font-medium text-slate-700">{label}</p>
      <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
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

function pageButtonClass(active: boolean) {
  return `rounded-full px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
    active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900"
  }`;
}
