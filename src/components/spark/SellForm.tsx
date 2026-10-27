"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  CATEGORIES,
  CONDITIONS,
  SALE_STATUSES,
  type Category,
  type Condition,
  type Product,
  type SaleStatus,
} from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

type Draft = {
  title: string;
  category: Category;
  condition: Condition;
  price: string;
  description: string;
  saleStatus: SaleStatus;
  imageUrl?: string;
};

const EMPTY: Draft = {
  title: "",
  category: "피규어",
  condition: "S급 미개봉",
  price: "",
  description: "",
  saleStatus: "판매중",
};

const PALETTES = [
  { base: "#fff7f3", ink: "#3f2a24", accent: "#ff7a45", soft: "#ffd8c7" },
  { base: "#fff5f7", ink: "#9f1239", accent: "#fb7185", soft: "#ffe4e6" },
  { base: "#fffbeb", ink: "#1e3a8a", accent: "#facc15", soft: "#fef3c7" },
  { base: "#f8fbff", ink: "#475569", accent: "#7dd3fc", soft: "#e0f2fe" },
];

export function SellForm() {
  const { addProduct, products, notify } = useSpark();
  const mounted = useMounted();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const palette = PALETTES[draft.category === "TCG" ? 2 : draft.category === "산리오/굿즈" ? 1 : 0];

  const preview: Product = {
    id: "preview",
    title: draft.title.trim() || "상품명을 입력해 주세요",
    ip: "새 매물",
    category: draft.category,
    price: Number(draft.price) > 0 ? Number(draft.price) : 0,
    condition: draft.condition,
    saleStatus: draft.saleStatus,
    description: draft.description.trim(),
    sellerId: "me",
    likes: 0,
    motif: draft.category === "TCG" ? "card" : draft.category === "피규어" ? "figure" : "plush",
    palette,
    shippingFee: 3000,
    location: "서울 · 택배",
    postedOrder: 99,
    postedLabel: "방금",
    imageUrl: draft.imageUrl,
  };

  const mine = mounted ? products.filter((product) => product.sellerId === "me" && product.id !== "preview") : [];

  function update<Key extends keyof Draft>(key: Key, value: Draft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function addSample() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="${palette.soft}"/><rect x="170" y="120" width="460" height="560" rx="40" fill="white"/><circle cx="400" cy="360" r="96" fill="${palette.accent}"/><text x="400" y="250" text-anchor="middle" font-size="28" fill="${palette.ink}" font-family="sans-serif">${draft.condition}</text></svg>`;
    update("imageUrl", `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`);
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") update("imageUrl", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const description = draft.description.trim();
    const price = Number(draft.price);
    if (!title) {
      setError("상품명을 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("가격은 0보다 큰 숫자로 입력해 주세요.");
      return;
    }
    if (!description) {
      setError("상품 설명을 입력해 주세요.");
      return;
    }

    const product: Product = {
      ...preview,
      id: `custom-${crypto.randomUUID()}`,
      title,
      price,
      description,
    };
    addProduct(product);
    setDraft(EMPTY);
    setNotice(`${title} 매물을 등록했어요.`);
    notify("매물이 등록되었어요.");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SELL</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">상품 등록</h1>
      <p className="mt-2 text-sm text-slate-500">입력하는 즉시 오른쪽 카드에 반영돼요.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <p className="text-xs font-medium text-slate-500">사진</p>
            <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => onFiles(event.target.files)} />
              <div className="flex flex-wrap items-center gap-3">
                {draft.imageUrl ? (
                  <img src={draft.imageUrl} alt="업로드한 상품 사진" className="h-24 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-xl bg-white text-xs text-slate-400">미리보기</div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                    사진 올리기
                  </button>
                  <button type="button" onClick={addSample} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                    샘플 사진
                  </button>
                  {draft.imageUrl ? (
                    <button type="button" onClick={() => update("imageUrl", undefined)} className="rounded-full px-3 py-2 text-sm text-slate-400">
                      삭제
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-slate-500">상품명</span>
            <input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="예: 하이큐!! 히나타 넨도로이드" className={fieldClass} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-500">카테고리</span>
              <select value={draft.category} onChange={(event) => update("category", event.target.value as Category)} className={fieldClass}>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-500">등급 / 상태</span>
              <select value={draft.condition} onChange={(event) => update("condition", event.target.value as Condition)} className={fieldClass}>
                {CONDITIONS.map((condition) => (
                  <option key={condition}>{condition}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-slate-500">가격</span>
            <input type="number" min={0} step={1000} inputMode="numeric" value={draft.price} onChange={(event) => update("price", event.target.value)} placeholder="0" className={fieldClass} />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium text-slate-500">설명</span>
            <textarea value={draft.description} onChange={(event) => update("description", event.target.value)} rows={5} placeholder="구성품, 사용감, 거래 방식을 적어 주세요." className={`${fieldClass} resize-y`} />
          </label>

          <div>
            <p className="text-xs font-medium text-slate-500">판매 상태</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SALE_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  aria-pressed={draft.saleStatus === status}
                  onClick={() => update("saleStatus", status)}
                  className={`rounded-full px-3 py-2.5 text-sm ${draft.saleStatus === status ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" className={`${primaryButtonClass} w-full`}>매물 등록</button>
        </form>

        <aside className="space-y-3 lg:sticky lg:top-28">
          <p className="text-xs font-medium text-slate-400">실시간 카드 미리보기</p>
          <ProductCard product={preview} linked={false} />
          <p className="text-sm leading-6 text-slate-500">{preview.description || "설명을 입력하면 여기에 표시돼요."}</p>
        </aside>
      </div>

      <div className="mt-10" aria-live="polite">
        {notice ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{notice}</p> : null}
        {mine.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-700">내가 등록한 매물 · {mine.length}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {mine.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                  <Link href={`/products/${product.id}`} className="mt-1 inline-block px-1 text-xs text-slate-400">
                    상세 보기
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
