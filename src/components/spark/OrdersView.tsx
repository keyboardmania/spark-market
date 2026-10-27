"use client";

import { useState } from "react";
import { formatPrice, type Order, type OrderStatus } from "@/data/mockData";
import { ConditionBadge } from "@/components/spark/Badges";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const STATUS_TONE: Record<OrderStatus, string> = {
  결제완료: "bg-slate-100 text-slate-600",
  배송중: "bg-sky-50 text-sky-700",
  배송완료: "bg-amber-50 text-amber-800",
  구매확정: "bg-emerald-50 text-emerald-700",
  거래취소: "bg-zinc-100 text-zinc-400",
};

export function OrdersView() {
  const mounted = useMounted();
  const { orders, updateOrder, notify } = useSpark();
  const [tab, setTab] = useState<"purchase" | "sale">("purchase");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  if (!mounted) {
    return <div className="mx-auto max-w-4xl px-4 py-8"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  const visible = orders.filter((order) => order.role === tab);

  function confirmPurchase(order: Order) {
    updateOrder(order.id, { status: "구매확정" });
    notify("구매를 확정했어요.");
  }

  function cancelOrder(order: Order) {
    updateOrder(order.id, { status: "거래취소" });
    setConfirmId(null);
    notify("거래를 취소했어요.");
  }

  function saveReview(order: Order) {
    if (!reviewText.trim()) return;
    updateOrder(order.id, { review: { rating, text: reviewText.trim() } });
    setReviewId(null);
    setReviewText("");
    notify("리뷰를 남겼어요.");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">ORDERS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">구매/판매 내역</h1>
      <div className="mt-6 flex gap-2" role="tablist" aria-label="내역 구분">
        {(
          [
            ["purchase", "구매 내역"],
            ["sale", "판매 내역"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center text-sm text-slate-400">내역이 없어요.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((order) => {
            const isPurchase = order.role === "purchase";
            const canConfirm = isPurchase && (order.status === "배송중" || order.status === "배송완료");
            const canCancel = order.status === "결제완료";
            const canTrack = Boolean(order.tracking) && order.status !== "거래취소";
            const canReview = isPurchase && order.status === "구매확정" && !order.review;
            return (
              <li key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex gap-4">
                  <ProductVisual motif={order.motif} palette={order.palette} ip={order.ip} uid={order.id} imageUrl={order.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_TONE[order.status]}`}>{order.status}</span>
                      <ConditionBadge condition={order.condition} />
                      <span className="text-xs text-slate-400">{order.orderedAt}</span>
                    </div>
                    <h2 className="mt-2 text-base font-medium text-slate-900">{order.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{isPurchase ? "판매자" : "구매자"} {order.counterpart} · {formatPrice(order.price)}</p>
                    <button type="button" onClick={() => setOpenId(openId === order.id ? null : order.id)} className="mt-2 text-xs text-slate-400 underline-offset-4 hover:underline">
                      {openId === order.id ? "상세 접기" : "상세 정보"}
                    </button>
                  </div>
                </div>

                {openId === order.id ? (
                  <dl className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
                    <div><dt className="text-xs text-slate-400">주문번호</dt><dd>{order.id}</dd></div>
                    <div><dt className="text-xs text-slate-400">결제수단</dt><dd>{order.paymentMethod}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs text-slate-400">배송지</dt><dd>{order.address}</dd></div>
                    {order.review ? <div className="sm:col-span-2"><dt className="text-xs text-slate-400">내 리뷰</dt><dd>{"★".repeat(order.review.rating)} {order.review.text}</dd></div> : null}
                  </dl>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" disabled={!canConfirm} onClick={() => confirmPurchase(order)} className={primaryButtonClass}>구매 확정</button>
                  {confirmId === order.id ? (
                    <>
                      <button type="button" onClick={() => cancelOrder(order)} className={ghostButtonClass}>취소 확정</button>
                      <button type="button" onClick={() => setConfirmId(null)} className={ghostButtonClass}>돌아가기</button>
                    </>
                  ) : (
                    <button type="button" disabled={!canCancel} onClick={() => setConfirmId(order.id)} className={ghostButtonClass}>거래 취소</button>
                  )}
                  <button type="button" disabled={!canTrack} onClick={() => setTrackingId(trackingId === order.id ? null : order.id)} className={ghostButtonClass}>배송 조회</button>
                  <button type="button" disabled={!canReview} onClick={() => setReviewId(reviewId === order.id ? null : order.id)} className={ghostButtonClass}>리뷰 남기기</button>
                </div>

                {trackingId === order.id && order.tracking ? (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <p className="font-medium text-slate-800">운송장 {order.tracking}</p>
                    <ol className="mt-3 space-y-2 text-slate-500">
                      <li>결제완료 · 판매자가 주문을 확인했어요</li>
                      <li>상품인수 · 택배사에 전달됐어요</li>
                      <li className={order.status === "배송완료" || order.status === "구매확정" ? "text-slate-800" : ""}>배송중 · 이동하고 있어요</li>
                      <li className={order.status === "배송완료" || order.status === "구매확정" ? "text-slate-800" : ""}>배송완료</li>
                    </ol>
                  </div>
                ) : null}

                {reviewId === order.id ? (
                  <form
                    className="mt-3 space-y-3 rounded-2xl bg-slate-50 p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveReview(order);
                    }}
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button key={score} type="button" aria-label={`${score}점`} onClick={() => setRating(score)} className={`h-9 w-9 rounded-full text-sm ${rating >= score ? "bg-slate-900 text-white" : "bg-white text-slate-400"}`}>
                          {score}
                        </button>
                      ))}
                    </div>
                    <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} rows={3} placeholder="거래는 어땠나요?" className={fieldClass} />
                    <button type="submit" className={primaryButtonClass}>리뷰 등록</button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
