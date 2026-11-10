"use client";

import { useMemo, useState } from "react";
import { ADMIN_MEMBERS, ADMIN_TRADES, formatPrice, formatRetentionDate, getProductById, type Review } from "@/data/mockData";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, DetailModal, DetailRows, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { useShared } from "@/data/shared";

const RATINGS = [1, 2, 3, 4, 5] as const;

export function ReviewsAdmin() {
  const reviews = useShared().reviews;
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState<"전체" | (typeof RATINGS)[number]>("전체");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = reviews
    .filter((review) => {
      const needle = query.trim().toLowerCase();
      const author = reviewAuthor(review);
      const title = productTitle(review.productId);
      const haystack = `${review.author} ${author?.email ?? ""} ${title}`.toLowerCase();
      const textOk = !needle || haystack.includes(needle);
      const ratingOk = rating === "전체" || review.rating === rating;
      return textOk && ratingOk;
    })
    .slice()
    .sort((a, b) => (sort === "desc" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));
  const selected = reviews.find((review) => review.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">REVIEWS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">리뷰 관리</h1>
      </div>
      <FilterBar>
        <FilterField label="리뷰 검색">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="작성자 닉네임·이메일 또는 상품명" className={fieldClass} />
        </FilterField>
        <FilterField label="별점" className="sm:max-w-[140px]">
          <select value={rating} onChange={(event) => setRating(event.target.value === "전체" ? "전체" : (Number(event.target.value) as (typeof RATINGS)[number]))} className={fieldClass}>
            <option value="전체">전체</option>
            {RATINGS.map((score) => (
              <option key={score} value={score}>
                {score}점
              </option>
            ))}
          </select>
        </FilterField>
        <button type="button" className="self-end rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" onClick={() => setSort((current) => (current === "desc" ? "asc" : "desc"))}>
          {sort === "desc" ? "작성일 최신순" : "작성일 과거순"}
        </button>
      </FilterBar>
      <Panel title="전체 리뷰" description={`${shown.length}건 표시 · 삭제된 리뷰도 소프트 딜리트 상태로 남아 있어요.`} flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>작성자</th>
              <th className={thClass}>상품명</th>
              <th className={thClass}>별점</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>상세</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((review) => {
              const author = reviewAuthor(review);
              return (
                <tr key={review.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(review.id)}>
                  <td className={tdClass}>
                    <span className="block font-medium text-slate-900">{review.author}</span>
                    {author ? <span className="text-xs text-slate-400">{author.email}</span> : null}
                  </td>
                  <td className={tdClass}>{productTitle(review.productId)}</td>
                  <td className={tdClass}>{"★".repeat(review.rating)}</td>
                  <td className={`${tdClass} tabular-nums`}>{review.createdAt}</td>
                  <td className={tdClass}>
                    <StatusPill tone={review.deletedAt ? "slate" : "emerald"}>{review.deletedAt ? "삭제됨" : "게시중"}</StatusPill>
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(review.id);
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={6}>
                  조건에 맞는 리뷰가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
      </Panel>
      {selected ? <ReviewDetail review={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function ReviewDetail({ review, onClose }: { review: Review; onClose: () => void }) {
  const close = useMemo(() => onClose, [onClose]);
  const product = getProductById(review.productId);
  const trade = ADMIN_TRADES.find((item) => item.id === review.orderId);
  const author = reviewAuthor(review);
  return (
    <DetailModal title="리뷰 상세" onClose={close} wide>
      <DetailRows
        rows={[
          { label: "작성자", value: author ? `${review.author} · ${author.email}` : review.author },
          { label: "별점", value: `${review.rating} / 5` },
          { label: "리뷰 내용", value: review.text },
          { label: "작성일", value: review.createdAt },
          { label: "관련 거래", value: trade ? `${trade.id} · ${trade.buyerEmail} → ${trade.sellerEmail} · ${trade.status} · ${formatPrice(trade.amount)}` : review.orderId },
          { label: "상품", value: product?.title ?? productTitle(review.productId) },
          { label: "보관", value: review.deletedAt ? `소프트 딜리트 ${formatRetentionDate(review.deletedAt)}${review.hardDeleteAt ? ` · 하드 딜리트 ${formatRetentionDate(review.hardDeleteAt)}` : ""}` : `미디어 만료 ${review.mediaExpiresAt}` },
        ]}
      />
      <div className="mt-4">
        <p className="text-xs text-slate-400">첨부 미디어</p>
        {review.media.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-3">
            {review.media.map((item) => (
              <li key={item.id}>
                <ReviewMedia item={item} />
                <p className="mt-1 text-xs text-slate-400">{item.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">첨부된 미디어가 없어요.</p>
        )}
      </div>
    </DetailModal>
  );
}

function ReviewMedia({ item }: { item: Review["media"][number] }) {
  const video = item.kind === "video" || /\.(mp4|mov)(\?|$)/i.test(`${item.name} ${item.url}`);
  if (video) return <video src={item.url} controls className="h-36 w-56 rounded-xl bg-slate-900" />;
  return <img src={item.url} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />;
}

function reviewAuthor(review: Review) {
  return ADMIN_MEMBERS.find((member) => member.name === review.author || member.id === `mem-${review.authorId}`) ?? null;
}

function productTitle(productId: string) {
  return getProductById(productId)?.title ?? productId;
}
