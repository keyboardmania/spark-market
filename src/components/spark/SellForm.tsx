"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CATEGORIES,
  ORIGINS,
  SALE_STATUSES,
  STORED_PRICE_PER_DOLLAR,
  type Category,
  type Origin,
  type Product,
  type ProductMedia,
  type SaleStatus,
} from "@/data/mockData";
import { ProductInquiry } from "@/components/spark/ChatScreen";
import { ProductCard } from "@/components/spark/ProductCard";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const MEDIA_HINT = "최대 15개 첨부, 최소 1개 필수, 사진(png, jpg, jpeg), 동영상(mp4, mov)";
const MAX_MEDIA = 15;
const MAX_PRICE = 1_000_000_000;
const SOLD_MESSAGE = "판매 완료된 상품은 수정할 수 없습니다.";

type Draft = {
  title: string;
  category: Category | "";
  country: Origin | "";
  price: string;
  description: string;
  saleStatus: SaleStatus;
  media: ProductMedia[];
};

type FieldErrors = Partial<Record<"title" | "category" | "country" | "media" | "price" | "description", string>>;

const EMPTY: Draft = {
  title: "",
  category: "",
  country: "",
  price: "",
  description: "",
  saleStatus: "판매중",
  media: [],
};

const PALETTES = [
  { base: "#fff7f3", ink: "#3f2a24", accent: "#ff7a45", soft: "#ffd8c7" },
  { base: "#fff5f7", ink: "#9f1239", accent: "#fb7185", soft: "#ffe4e6" },
  { base: "#fffbeb", ink: "#1e3a8a", accent: "#facc15", soft: "#fef3c7" },
  { base: "#f8fbff", ink: "#475569", accent: "#7dd3fc", soft: "#e0f2fe" },
];

function paletteFor(category: Category | "") {
  if (category === "TCG") return PALETTES[2];
  if (category === "산리오/굿즈") return PALETTES[1];
  if (category === "피규어") return PALETTES[0];
  return PALETTES[3];
}

function motifFor(category: Category | "") {
  if (category === "TCG") return "card" as const;
  if (category === "피규어") return "figure" as const;
  return "plush" as const;
}

function mediaKind(file: File): ProductMedia["kind"] | null {
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase() : "";
  if (extension === "png" || extension === "jpg" || extension === "jpeg") return "image";
  if (extension === "mp4" || extension === "mov") return "video";
  if (extension) return null;
  if (file.type === "image/png" || file.type === "image/jpeg") return "image";
  if (file.type === "video/mp4" || file.type === "video/quicktime") return "video";
  return null;
}

function priceIssue(value: string) {
  const message = "가격은 $0부터 $1,000,000 사이의 숫자만 입력할 수 있어요.";
  if (!/^\d+$/.test(value)) return message;
  if (Number(value) * STORED_PRICE_PER_DOLLAR > MAX_PRICE) return message;
  return null;
}

function draftFrom(product: Product): Draft {
  const media =
    product.media && product.media.length > 0
      ? product.media
      : product.imageUrl
        ? [{ id: `${product.id}-image`, name: "등록된 사진", kind: "image" as const, url: product.imageUrl }]
        : [];
  return {
    title: product.title,
    category: product.category,
    country: product.country ?? "",
    price: String(Math.round(product.price / STORED_PRICE_PER_DOLLAR)),
    description: product.description,
    saleStatus: product.saleStatus,
    media,
  };
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("파일을 읽지 못했어요."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("파일을 읽지 못했어요."));
    reader.readAsDataURL(file);
  });
}

export function SellForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { addProduct, updateProduct, products, isProductDeleted, notify } = useSpark();
  const mounted = useMounted();
  const fileRef = useRef<HTMLInputElement>(null);
  const warned = useRef(false);
  const hydratedId = useRef<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [soldOpen, setSoldOpen] = useState(false);
  const editing = Boolean(productId);
  const product = productId ? products.find((item) => item.id === productId) : undefined;
  const deleted = productId ? isProductDeleted(productId) : false;
  const locked = product?.saleStatus === "판매완료";
  const palette = paletteFor(draft.category);
  const firstImage = draft.media.find((item) => item.kind === "image");

  const preview: Product = {
    id: product?.id ?? "preview",
    title: draft.title.trim() || "상품명을 입력해 주세요",
    ip: "새 매물",
    category: draft.category || "피규어",
    country: draft.country || undefined,
    price: /^\d+$/.test(draft.price) ? Number(draft.price) * STORED_PRICE_PER_DOLLAR : 0,
    condition: product?.condition ?? "S급",
    saleStatus: draft.saleStatus,
    description: draft.description.trim(),
    sellerId: product?.sellerId ?? "me",
    likes: product?.likes ?? 0,
    motif: motifFor(draft.category),
    palette,
    shippingFee: product?.shippingFee ?? 3000,
    location: product?.location ?? "서울 · 택배",
    postedOrder: product?.postedOrder ?? 99,
    postedLabel: product?.postedLabel ?? "방금",
    imageUrl: firstImage?.url,
    media: draft.media,
  };

  const mine = mounted ? products.filter((item) => item.sellerId === "me" && item.id !== "preview") : [];

  useEffect(() => {
    if (!product || hydratedId.current === product.id) return;
    hydratedId.current = product.id;
    setDraft(draftFrom(product));
  }, [product]);

  useEffect(() => {
    if (!locked || warned.current) return;
    warned.current = true;
    setSoldOpen(true);
    notify(SOLD_MESSAGE);
  }, [locked, notify]);

  function update<Key extends keyof Draft>(key: Key, value: Draft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function addSample() {
    if (draft.media.length >= MAX_MEDIA) {
      setErrors((current) => ({ ...current, media: "최대 15개까지 첨부할 수 있어요." }));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = palette.soft;
    context.fillRect(0, 0, 800, 800);
    context.fillStyle = "#ffffff";
    context.fillRect(170, 120, 460, 560);
    context.fillStyle = palette.accent;
    context.beginPath();
    context.arc(400, 390, 96, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = palette.ink;
    context.font = "28px sans-serif";
    context.textAlign = "center";
    context.fillText(draft.title.trim() || "Spark", 400, 250);
    const url = canvas.toDataURL("image/png");
    setDraft((current) => {
      if (current.media.length >= MAX_MEDIA) return current;
      return {
        ...current,
        media: [...current.media, { id: crypto.randomUUID(), name: "sample.png", kind: "image", url }],
      };
    });
    setErrors((current) => ({ ...current, media: undefined }));
  }

  async function onFiles(files: FileList | null) {
    const incoming = files ? [...files] : [];
    if (fileRef.current) fileRef.current.value = "";
    if (incoming.length === 0) return;
    const invalid = incoming.filter((file) => !mediaKind(file));
    const valid = incoming.filter((file) => mediaKind(file));
    const room = MAX_MEDIA - draft.media.length;
    const messages: string[] = [];
    if (invalid.length > 0) messages.push("사진(png, jpg, jpeg), 동영상(mp4, mov)만 첨부할 수 있어요.");
    if (valid.length > room) messages.push("최대 15개까지 첨부할 수 있어요.");
    if (messages.length > 0) setErrors((current) => ({ ...current, media: messages.join(" ") }));
    else setErrors((current) => ({ ...current, media: undefined }));
    const accepted = valid.slice(0, Math.max(room, 0));
    if (accepted.length === 0) return;
    const loaded = await Promise.all(
      accepted.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        kind: mediaKind(file) ?? "image",
        url: await readFile(file),
      })),
    );
    setDraft((current) => ({ ...current, media: [...current.media, ...loaded].slice(0, MAX_MEDIA) }));
  }

  function removeMedia(id: string) {
    setDraft((current) => ({ ...current, media: current.media.filter((item) => item.id !== id) }));
  }

  function validate(next: Draft) {
    const nextErrors: FieldErrors = {};
    if (!next.title.trim()) nextErrors.title = "상품명을 입력해 주세요.";
    if (!next.category) nextErrors.category = "물품 종류를 선택해 주세요.";
    if (!next.country) nextErrors.country = "국가를 선택해 주세요.";
    if (next.media.length < 1) nextErrors.media = `최소 1개 이상 첨부해 주세요. ${MEDIA_HINT}`;
    else if (next.media.length > MAX_MEDIA) nextErrors.media = "최대 15개까지 첨부할 수 있어요.";
    const priceMessage = priceIssue(next.price);
    if (priceMessage) nextErrors.price = priceMessage;
    if (next.description.trim().length < 10) nextErrors.description = "상품 설명은 10자 이상 입력해 주세요.";
    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) {
      setSoldOpen(true);
      notify(SOLD_MESSAGE);
      return;
    }
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    if (!draft.category || !draft.country) return;

    const description = draft.description.trim();
    const saved: Product = {
      ...preview,
      id: product?.id ?? `custom-${crypto.randomUUID()}`,
      title: draft.title.trim(),
      category: draft.category,
      country: draft.country,
      price: Number(draft.price) * STORED_PRICE_PER_DOLLAR,
      description,
      imageUrl: firstImage?.url,
      media: draft.media,
    };

    if (editing && product) {
      const updated = updateProduct(product.id, saved);
      if (!updated) {
        setSoldOpen(true);
        notify(SOLD_MESSAGE);
        return;
      }
      setNotice(`${saved.title} 매물을 수정했어요.`);
      notify("매물을 수정했어요.");
      return;
    }

    addProduct(saved);
    setDraft(EMPTY);
    setNotice(`${saved.title} 매물을 등록했어요.`);
    notify("매물이 등록되었어요.");
  }

  if (editing && !mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (editing && deleted) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">삭제된 상품은 수정할 수 없어요</h1>
        <p className="mt-3 text-sm text-slate-500">삭제한 상품은 복구할 수 없으며 목록에 표시되지 않습니다.</p>
        <Link href="/sell" className={`${ghostButtonClass} mt-6`}>상품 등록으로</Link>
      </div>
    );
  }

  if (editing && !product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">상품을 찾을 수 없어요</h1>
        <Link href="/sell" className={`${ghostButtonClass} mt-6`}>상품 등록으로</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SELL</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{editing ? "상품 수정" : "상품 등록"}</h1>
      <p className="mt-2 text-sm text-slate-500">입력하는 즉시 오른쪽 카드에 반영돼요.</p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form noValidate onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <fieldset disabled={locked} className="space-y-5 disabled:opacity-60">
            <div>
              <p className="text-xs font-medium text-slate-500">사진 / 동영상</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{MEDIA_HINT}</p>
              <div className="mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.mp4,.mov,image/png,image/jpeg,video/mp4,video/quicktime"
                  className="sr-only"
                  onChange={(event) => void onFiles(event.target.files)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  {draft.media.length === 0 ? (
                    <div className="grid h-24 w-24 place-items-center rounded-xl bg-white text-xs text-slate-400">미리보기</div>
                  ) : (
                    draft.media.map((item) => (
                      <div key={item.id} className="relative">
                        {item.kind === "video" ? (
                          <video src={item.url} className="h-24 w-24 rounded-xl bg-slate-900 object-cover" muted />
                        ) : (
                          <img src={item.url} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(item.id)}
                          className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-slate-500 shadow"
                          aria-label={`${item.name} 삭제`}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                    파일 올리기
                  </button>
                  <button type="button" onClick={addSample} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                    샘플 사진
                  </button>
                  <span className="text-xs text-slate-400">{draft.media.length}/{MAX_MEDIA}</span>
                </div>
              </div>
              {errors.media ? <p className="mt-2 text-xs text-rose-600">{errors.media}</p> : null}
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-500">상품명</span>
              <input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="예: 하이큐!! 히나타 넨도로이드" className={fieldClass} />
              {errors.title ? <span className="block text-xs text-rose-600">{errors.title}</span> : null}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-xs font-medium text-slate-500">물품 종류</span>
                <select value={draft.category} onChange={(event) => update("category", event.target.value as Category | "")} className={fieldClass}>
                  <option value="">선택해 주세요</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category ? <span className="block text-xs text-rose-600">{errors.category}</span> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-xs font-medium text-slate-500">국가</span>
                <select value={draft.country} onChange={(event) => update("country", event.target.value as Origin | "")} className={fieldClass}>
                  <option value="">선택해 주세요</option>
                  {ORIGINS.map((origin) => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
                {errors.country ? <span className="block text-xs text-rose-600">{errors.country}</span> : null}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-500">가격 (USD)</span>
              <input
                inputMode="numeric"
                value={draft.price}
                onChange={(event) => update("price", event.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className={fieldClass}
              />
              <span className={`block text-xs ${errors.price ? "text-rose-600" : "text-slate-400"}`}>
                {errors.price ?? "$0부터 $1,000,000까지 숫자만 입력할 수 있어요."}
              </span>
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium text-slate-500">설명</span>
              <textarea
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
                rows={5}
                placeholder="구성품, 사용감, 거래 방식을 10자 이상 적어 주세요."
                className={`${fieldClass} resize-y`}
              />
              {errors.description ? <span className="block text-xs text-rose-600">{errors.description}</span> : null}
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

            {Object.values(errors).some(Boolean) ? <p role="alert" className="text-sm text-rose-600">입력한 내용을 다시 확인해 주세요.</p> : null}
            <button type="submit" className={`${primaryButtonClass} w-full`}>{editing ? "수정 저장" : "매물 등록"}</button>
          </fieldset>
          {editing && product ? (
            <div className="mt-4">
              <DeleteProductButton product={product} onDeleted={() => router.push("/sell")} />
            </div>
          ) : null}
        </form>

        <aside className="space-y-3 lg:sticky lg:top-28">
          <p className="text-xs font-medium text-slate-400">실시간 카드 미리보기</p>
          <ProductCard
            product={preview}
            linked={false}
            meta={["새 매물", draft.category || "물품 종류", draft.country || "국가"].join(" · ")}
          />
          <p className="text-sm leading-6 text-slate-500">{preview.description || "설명을 입력하면 여기에 표시돼요."}</p>
        </aside>
      </div>

      <div className="mt-10" aria-live="polite">
        {notice ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{notice}</p> : null}
        {!editing && mine.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-slate-700">내가 등록한 매물 · {mine.length}</h2>
            <ul className="mt-4 grid grid-cols-1 items-start gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {mine.map((item) => (
                <li key={item.id} className="flex min-w-0 flex-col gap-2 self-start">
                  <div className="w-full">
                    <ProductCard product={item} />
                  </div>
                  <ProductInquiry productId={item.id} compact />
                  <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-slate-400">
                    <Link href={`/sell/${item.id}`}>수정</Link>
                    <DeleteProductButton product={item} variant="text" />
                    <Link href={`/products/${item.id}`}>상세 보기</Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {soldOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={() => setSoldOpen(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sold-lock-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="sold-lock-title" className="text-lg font-semibold text-slate-900">수정할 수 없어요</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{SOLD_MESSAGE}</p>
            <button type="button" onClick={() => setSoldOpen(false)} className={`${primaryButtonClass} mt-5 w-full`}>확인</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DeleteProductButton({
  product,
  variant = "ghost",
  onDeleted,
}: {
  product: Product;
  variant?: "ghost" | "text";
  onDeleted?: () => void;
}) {
  const { softDeleteProduct, notify } = useSpark();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === "text" ? "text-xs text-slate-400" : ghostButtonClass}
      >
        삭제
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={() => setOpen(false)}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-product-title" className="text-lg font-semibold text-slate-900">상품을 삭제할까요?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {product.title}을 삭제하면 복구할 수 없습니다. 목록에서 바로 사라집니다.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className={`${ghostButtonClass} flex-1`}>취소</button>
              <button
                type="button"
                onClick={() => {
                  softDeleteProduct(product.id);
                  setOpen(false);
                  notify("상품을 삭제했어요. 복구할 수 없습니다.");
                  onDeleted?.();
                }}
                className={`${primaryButtonClass} flex-1`}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
