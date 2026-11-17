"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  ORIGINS,
  PRODUCTS,
  SALE_STATUSES,
  compareByPopularity,
  createdAtRank,
  type Category,
  type Origin,
  type Product,
  type SaleStatus,
} from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { useI18n } from "@/features/i18n/useI18n";

const SORTS = [
  { id: "new", label: "최신순" },
  { id: "likes", label: "인기순" },
  { id: "priceAsc", label: "낮은 가격순" },
  { id: "priceDesc", label: "높은 가격순" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export function SearchResultsView() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const keyword = (searchParams.get("q") ?? "").trim();
  const { products, wishlistIds } = useSpark();
  const mounted = useMounted();
  const source = mounted ? products : PRODUCTS;
  const wishedIds = useMemo(() => new Set(mounted ? wishlistIds : []), [mounted, wishlistIds]);
  const [category, setCategory] = useState<Category | "전체">("전체");
  const [origin, setOrigin] = useState<Origin | "전체">("전체");
  const [status, setStatus] = useState<SaleStatus | "전체">("전체");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortId>("new");
  const needle = keyword.toLowerCase();

  useEffect(() => {
    setCategory("전체");
    setOrigin("전체");
    setStatus("전체");
    setMinPrice("");
    setMaxPrice("");
    setSort("new");
  }, [keyword]);

  const matches = useMemo(() => {
    if (!needle) return [];
    const min = minPrice.trim() === "" ? null : Number(minPrice);
    const max = maxPrice.trim() === "" ? null : Number(maxPrice);
    const next = source.filter((product) => {
      if (!product.title.toLowerCase().includes(needle)) return false;
      if (category !== "전체" && product.category !== category) return false;
      if (origin !== "전체" && product.country !== origin) return false;
      if (status !== "전체" && product.saleStatus !== status) return false;
      if (min !== null && !Number.isNaN(min) && product.price < min) return false;
      if (max !== null && !Number.isNaN(max) && product.price > max) return false;
      return true;
    });
    return [...next].sort((a, b) => compareProducts(a, b, sort, wishedIds));
  }, [category, maxPrice, minPrice, needle, origin, source, sort, status, wishedIds]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SEARCH</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {keyword ? `“${keyword}” 검색 결과` : "검색"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {keyword ? `${matches.length}개` : "헤더 검색창에 키워드를 입력해 주세요."}
          </p>
        </div>
        {keyword ? (
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
        ) : null}
      </div>

      {keyword ? (
        <div className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-wide text-slate-400">{t("searchPrimary")}</p>
            <FilterRow label={t("searchCategory")}>
              <FilterChip active={category === "전체"} onClick={() => setCategory("전체")}>{t("searchAll")}</FilterChip>
              {CATEGORIES.map((item) => (
                <FilterChip key={item} active={category === item} onClick={() => setCategory(item)}>{item}</FilterChip>
              ))}
            </FilterRow>
          </div>
          <div className="space-y-4 border-t border-slate-200/80 pt-5">
            <p className="text-xs font-medium tracking-wide text-slate-400">{t("searchSecondary")}</p>
            <FilterRow label={t("searchOrigin")}>
              <FilterChip active={origin === "전체"} onClick={() => setOrigin("전체")}>{t("searchAll")}</FilterChip>
              {ORIGINS.map((item) => (
                <FilterChip key={item} active={origin === item} onClick={() => setOrigin(item)}>{item}</FilterChip>
              ))}
            </FilterRow>
            <FilterRow label={t("searchStatus")}>
              <FilterChip active={status === "전체"} onClick={() => setStatus("전체")}>{t("searchAll")}</FilterChip>
              {SALE_STATUSES.map((item) => (
                <FilterChip key={item} active={status === item} onClick={() => setStatus(item)}>{item}</FilterChip>
              ))}
            </FilterRow>
            <div className="flex flex-wrap items-end gap-4">
              <p className="w-full text-sm font-medium text-slate-700 sm:w-24">{t("searchPrice")}</p>
              <label className="text-sm text-slate-600">
                {t("searchPriceMin")}
                <input inputMode="numeric" value={minPrice} onChange={(event) => setMinPrice(event.target.value.replace(/\D/g, ""))} className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900" />
              </label>
              <label className="text-sm text-slate-600">
                {t("searchPriceMax")}
                <input inputMode="numeric" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value.replace(/\D/g, ""))} className="mt-1.5 block w-32 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900" />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {!keyword ? null : matches.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center text-sm text-slate-400">
          이 조건에 맞는 매물이 없어요.
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {matches.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function compareProducts(a: Product, b: Product, sort: SortId, wishedIds: ReadonlySet<string>) {
  if (sort === "priceAsc") return a.price - b.price;
  if (sort === "priceDesc") return b.price - a.price;
  if (sort === "likes") return compareByPopularity(a, b, wishedIds);
  return createdAtRank(b) - createdAtRank(a);
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-24 shrink-0 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition ${active ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"}`}>
      {children}
    </button>
  );
}
