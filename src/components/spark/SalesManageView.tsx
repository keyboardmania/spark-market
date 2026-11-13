"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SALE_STATUS_OPTIONS, type SaleStatus } from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const TABS = SALE_STATUS_OPTIONS.map((option) => ({
  id: option.code,
  label: option.label,
  status: option.status,
}));

function parseTab(value: string | null): (typeof TABS)[number]["id"] {
  const match = TABS.find((tab) => tab.id === value);
  return match?.id ?? "ON_SALE";
}

export function SalesManageView() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products } = useSpark();
  const active = parseTab(searchParams.get("status"));
  const status = TABS.find((tab) => tab.id === active)?.status ?? "판매중";
  const mine = mounted ? products.filter((product) => product.sellerId === "me" && product.saleStatus === status) : [];

  function selectTab(next: (typeof TABS)[number]["id"]) {
    const params = new URLSearchParams();
    params.set("status", next);
    router.replace(`/selling?${params.toString()}`, { scroll: false });
  }

  if (!mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SELLING</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">판매 관리</h1>
          <p className="mt-2 text-sm text-slate-500">판매중, 예약중, 판매완료 상품을 나눠 봅니다.</p>
        </div>
        <Link href="/sell" className={ghostButtonClass}>상품 등록</Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="판매 상태">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => selectTab(tab.id)}
            className={`rounded-full px-4 py-2 text-sm ${active === tab.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mine.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">
          {emptyLabel(status)}
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {mine.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function emptyLabel(status: SaleStatus) {
  if (status === "예약중") return "예약중인 상품이 없어요.";
  if (status === "판매완료") return "판매완료된 상품이 없어요.";
  return "판매중인 상품이 없어요.";
}
