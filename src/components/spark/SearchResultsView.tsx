"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  ORIGINS,
  PRODUCTS,
  SALE_STATUSES,
  compareByPopularity,
  createdAtRank,
  type Origin,
  type Product,
  type SaleStatus,
} from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const SORTS = [
  { id: "new", label: "최신순" },
  { id: "likes", label: "인기순" },
  { id: "priceAsc", label: "낮은 가격순" },
  { id: "priceDesc", label: "높은 가격순" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export function SearchResultsView() {
  const searchParams = useSearchParams();
  const keyword = (searchParams.get("q") ?? "").trim();
  const { products, wishlistIds } = useSpark();
  const mounted = useMounted();
  const source = mounted ? products : PRODUCTS;
  const wishedIds = useMemo(() => new Set(mounted ? wishlistIds : []), [mounted, wishlistIds]);
  const [origin, setOrigin] = useState<Origin | "전체">("전체");
  const [status, setStatus] = useState<SaleStatus | "전체">("전체");
  const [sort, setSort] = useState<SortId>("new");
  const needle = keyword.toLowerCase();

  useEffect(() => {
    setOrigin("전체");
    setStatus("전체");
    setSort("new");
  }, [keyword]);

  const matches = useMemo(() => {
    if (!needle) return [];
    const next = source.filter((product) => {
      if (!`${product.title} ${product.category}`.toLowerCase().includes(needle)) return false;
      if (origin !== "전체" && product.country !== origin) return false;
      if (status !== "전체" && product.saleStatus !== status) return false;
      return true;
    });
    return [...next].sort((a, b) => compareProducts(a, b, sort, wishedIds));
  }, [needle, origin, source, status, sort, wishedIds]);

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
        <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
          <FilterRow label="국가">
            <FilterChip active={origin === "전체"} onClick={() => setOrigin("전체")}>
              전체
            </FilterChip>
            {ORIGINS.map((item) => (
              <FilterChip key={item} active={origin === item} onClick={() => setOrigin(item)}>
                {item}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="판매 상태">
            <FilterChip active={status === "전체"} onClick={() => setStatus("전체")}>
              전체
            </FilterChip>
            {SALE_STATUSES.map((item) => (
              <FilterChip key={item} active={status === item} onClick={() => setStatus(item)}>
                {item}
              </FilterChip>
            ))}
          </FilterRow>
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
      <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto pb-1">
        {children}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={chipClass(active)}>
      {children}
    </button>
  );
}

function chipClass(active: boolean) {
  return `shrink-0 rounded-full px-3.5 py-2 text-sm transition ${
    active ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-800"
  }`;
}
