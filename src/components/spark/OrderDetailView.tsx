"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CANCEL_REASONS, SELLERS, formatPrice, getProductById } from "@/data/mockData";
import { ProductInquiry } from "@/components/spark/ChatScreen";
import { ORDER_STATUS_TONE } from "@/components/spark/OrdersView";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

function formatRequestedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function OrderDetailView({ id }: { id: string }) {
  const mounted = useMounted();
  const router = useRouter();
  const { orders, user, requestCancel, notify } = useSpark();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const handledQuery = useRef(false);
  const order = orders.find((item) => item.id === id);
  const canRequest = Boolean(order && (order.status === "결제완료" || order.status === "배송완료") && !order.cancelRequest);

  useEffect(() => {
    if (!mounted || handledQuery.current) return;
    const requested = new URLSearchParams(window.location.search).get("cancel") === "1";
    if (!requested) return;
    handledQuery.current = true;
    if (canRequest) {
      setReason("");
      setDetail("");
      setCancelOpen(true);
    }
    router.replace(`/orders/${id}`, { scroll: false });
  }, [mounted, canRequest, id, router]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">주문을 찾을 수 없어요</h1>
        <Link href="/orders" className={`${ghostButtonClass} mt-6`}>
          구매/판매 내역
        </Link>
      </div>
    );
  }

  const product = getProductById(order.productId);
  const description = product?.description.trim() ? product.description : "등록된 상품 설명을 찾을 수 없어요.";
  const seller = order.role === "purchase" ? SELLERS.find((item) => item.name === order.counterpart) : undefined;
  const counterpartLabel = order.role === "purchase" ? "판매자" : "구매자";
  const vip = user?.membership === "vip";
  const feeRate = vip ? 0.06 : 0.1;
  const fee = Math.round(order.price * feeRate);
  const payout = order.price - fee;
  const settlementStatus = order.status === "구매확정" ? "정산완료" : order.status === "거래취소" ? "정산취소" : "정산대기";
  const feeLabel = vip ? "중개 수수료 6% · Spark VIP" : "중개 수수료 10%";
  const detailLength = detail.trim().length;
  const canSubmit = reason !== "" && detailLength >= 10;
  const showCancelButton = !order.cancelRequest && order.status !== "구매확정" && order.status !== "거래취소";
  const cancelDisabled = order.status === "배송중";

  function openCancel() {
    setReason("");
    setDetail("");
    setCancelOpen(true);
  }

  function submitCancel() {
    if (!order || !canSubmit) return;
    requestCancel(order.id, reason, detail.trim());
    notify("취소 요청을 보냈어요.");
    setCancelOpen(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="text-sm text-slate-500 hover:text-slate-900">
        구매/판매 내역
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${ORDER_STATUS_TONE[order.status]}`}>{order.status}</span>
        {order.cancelRequest && order.status !== "거래취소" ? (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">취소 요청중</span>
        ) : null}
        <span className="text-xs text-slate-400">{order.id}</span>
        <span className="text-xs text-slate-400">{order.orderedAt}</span>
      </div>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{order.title}</h1>

      <div className="mt-8 space-y-4">
        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-900">상품</h2>
          <div className="mt-4 flex gap-4">
            <ProductVisual
              motif={order.motif}
              palette={order.palette}
              ip={order.ip}
              uid={order.id}
              imageUrl={order.imageUrl ?? product?.imageUrl}
              alt={order.title}
              className="h-28 w-28 shrink-0 rounded-xl"
            />
            <div className="min-w-0">
              <p className="text-base font-medium text-slate-900">{order.title}</p>
              <p className="mt-1 text-sm text-slate-500">수량 {order.quantity ?? 1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-900">거래 및 결제</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">상품 금액</dt>
              <dd className="mt-1 font-medium text-slate-900">{formatPrice(order.price)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">결제 수단</dt>
              <dd className="mt-1 text-slate-700">{order.paymentMethod}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-400">배송지</dt>
              <dd className="mt-1 text-slate-700">{order.address}</dd>
            </div>
            {order.tracking ? (
              <div>
                <dt className="text-xs text-slate-400">운송장</dt>
                <dd className="mt-1 text-slate-700">{order.tracking}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h2 className="text-sm font-medium text-slate-900">{counterpartLabel}</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700">
              {order.counterpart.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">{order.counterpart}</p>
              {seller ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {seller.handle} · {seller.city}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {order.role === "sale" ? <ProductInquiry productId={order.productId} /> : null}

        {order.role === "sale" ? (
          <section className="rounded-2xl border border-slate-200 p-4">
            <h2 className="text-sm font-medium text-slate-900">정산</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="상품 금액" value={formatPrice(order.price)} />
              <Row label={feeLabel} value={formatPrice(fee)} />
              <Row label="최종 정산 금액" value={formatPrice(payout)} strong />
              <Row label="정산 상태" value={settlementStatus} />
            </dl>
          </section>
        ) : null}

        {order.cancelRequest ? (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-medium text-slate-900">취소 요청</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">사유</dt>
                <dd className="mt-1 text-slate-700">{order.cancelRequest.reason}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">상세 사유</dt>
                <dd className="mt-1 leading-6 text-slate-700">{order.cancelRequest.detail}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">요청 시각</dt>
                <dd className="mt-1 text-slate-700">{formatRequestedAt(order.cancelRequest.requestedAt)}</dd>
              </div>
            </dl>
            {order.cancelRequest.autoCancelled ? (
              <p className="mt-4 text-sm text-slate-600">판매자 3일 미응답으로 자동 취소되었어요.</p>
            ) : null}
          </section>
        ) : null}
      </div>

      {showCancelButton ? (
        <div className="mt-6">
          <button type="button" disabled={cancelDisabled} onClick={openCancel} className={ghostButtonClass}>
            거래 취소 요청
          </button>
          {cancelDisabled ? <p className="mt-2 text-xs text-slate-500">결제완료 또는 배송완료 상태에서만 취소할 수 있어요.</p> : null}
        </div>
      ) : null}

      {cancelOpen ? (
        <CancelModal
          reason={reason}
          detail={detail}
          detailLength={detailLength}
          canSubmit={canSubmit}
          onReason={setReason}
          onDetail={setDetail}
          onClose={() => setCancelOpen(false)}
          onSubmit={submitCancel}
        />
      ) : null}
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={strong ? "font-semibold text-slate-900" : "text-slate-800"}>{value}</dd>
    </div>
  );
}

function CancelModal({
  reason,
  detail,
  detailLength,
  canSubmit,
  onReason,
  onDetail,
  onClose,
  onSubmit,
}: {
  reason: string;
  detail: string;
  detailLength: number;
  canSubmit: boolean;
  onReason: (value: string) => void;
  onDetail: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    selectRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cancel-order-title" className="text-lg font-semibold text-slate-900">
          거래 취소 요청
        </h2>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) onSubmit();
          }}
        >
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">취소 사유</span>
            <select ref={selectRef} value={reason} onChange={(event) => onReason(event.target.value)} className={fieldClass}>
              <option value="">사유를 선택해 주세요</option>
              {CANCEL_REASONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="flex items-center justify-between text-xs text-slate-500">
              상세 사유
              <span className={detailLength < 10 ? "text-rose-600" : "text-slate-400"}>
                {detailLength}/10
              </span>
            </span>
            <textarea
              value={detail}
              onChange={(event) => onDetail(event.target.value)}
              placeholder="취소 사유를 10자 이상 입력해 주세요."
              rows={4}
              className={fieldClass}
            />
          </label>
          <p className="text-xs leading-5 text-slate-500">판매자 3일 미응답 시 자동 취소 처리됩니다.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={ghostButtonClass}>
              닫기
            </button>
            <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
              취소 요청
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
