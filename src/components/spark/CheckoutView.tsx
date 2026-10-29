"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, getSeller, type Product } from "@/data/mockData";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const METHODS = ["신용/체크카드", "카카오페이", "네이버페이", "토스페이", "무통장입금"] as const;

export function CheckoutView({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const mounted = useMounted();
  const { products, placeOrder, notify, isProductDeleted } = useSpark();
  const deleted = mounted && isProductDeleted(id);
  const live = products.find((product) => product.id === id);
  const product = deleted ? undefined : mounted ? (live ?? initialProduct) : initialProduct;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [postal, setPostal] = useState("");
  const [address, setAddress] = useState("");
  const [detail, setDetail] = useState("");
  const [memo, setMemo] = useState("");
  const [method, setMethod] = useState<(typeof METHODS)[number] | "">("");
  const [finance, setFinance] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [purchase, setPurchase] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!initialProduct && !mounted) {
    return <div className="mx-auto max-w-6xl px-4 py-10"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">결제할 상품이 없어요</h1>
        <Link href="/" className={`${ghostButtonClass} mt-6`}>홈으로</Link>
      </div>
    );
  }

  const unavailable = product.saleStatus !== "판매중";
  const addressReady = name.trim() && phone.trim().length >= 8 && address.trim();
  const agreed = finance && privacy && purchase;
  const canPay = !unavailable && agreed && Boolean(method) && Boolean(addressReady);

  function pay() {
    if (!canPay || !product || !method) {
      setError("배송지, 결제수단, 필수 약관을 확인해 주세요.");
      return;
    }
    const orderId = `SPK-${Date.now().toString().slice(-8)}`;
    placeOrder({
      id: orderId,
      role: "purchase",
      productId: product.id,
      title: product.title,
      ip: product.ip,
      price: product.price + product.shippingFee,
      condition: product.condition,
      motif: product.motif,
      palette: product.palette,
      imageUrl: product.imageUrl,
      status: "결제완료",
      orderedAt: "2026.10.27",
      counterpart: getSeller(product.sellerId).name,
      address: `${postal ? `${postal} ` : ""}${address} ${detail}`.trim(),
      paymentMethod: method,
      tracking: null,
      review: null,
    });
    setDone(orderId);
    notify("결제가 완료되었어요.");
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-400">PAID</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">결제가 완료되었어요</h1>
        <p className="mt-3 text-sm text-slate-500">주문번호 {done}. 판매자에게 주문이 전달됐어요.</p>
        {memo ? <p className="mt-2 text-xs text-slate-400">배송 메모: {memo}</p> : null}
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/orders" className={primaryButtonClass}>구매 내역 보기</Link>
          <Link href="/" className={ghostButtonClass}>계속 구경하기</Link>
        </div>
      </div>
    );
  }

  const total = product.price + product.shippingFee;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-200 p-4 lg:sticky lg:top-28">
        <ProductVisual motif={product.motif} palette={product.palette} ip={product.ip} uid={`pay-${product.id}`} imageUrl={product.imageUrl} alt={product.title} className="aspect-square rounded-2xl" />
        <p className="mt-4 text-xs text-slate-400">{product.ip}</p>
        <h1 className="mt-2 text-lg font-semibold leading-6 text-slate-900">{product.title}</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="상품 금액" value={formatPrice(product.price)} />
          <Row label="배송비" value={product.shippingFee === 0 ? "무료" : formatPrice(product.shippingFee)} />
          <Row label="결제 금액" value={formatPrice(total)} strong />
        </dl>
      </aside>

      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          pay();
        }}
      >
        <section>
          <h2 className="text-lg font-semibold text-slate-900">배송지</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-slate-500">받는 사람
              <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="김서연" />
            </label>
            <label className="space-y-2 text-xs text-slate-500">연락처
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} placeholder="010-0000-0000" />
            </label>
            <label className="space-y-2 text-xs text-slate-500 sm:col-span-2">우편번호
              <input value={postal} onChange={(event) => setPostal(event.target.value)} className={fieldClass} placeholder="04799" />
            </label>
            <label className="space-y-2 text-xs text-slate-500 sm:col-span-2">주소
              <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass} placeholder="서울특별시 성동구 연무장길 12" />
            </label>
            <label className="space-y-2 text-xs text-slate-500 sm:col-span-2">상세 주소
              <input value={detail} onChange={(event) => setDetail(event.target.value)} className={fieldClass} placeholder="4층" />
            </label>
            <label className="space-y-2 text-xs text-slate-500 sm:col-span-2">배송 메모
              <input value={memo} onChange={(event) => setMemo(event.target.value)} className={fieldClass} placeholder="부재 시 문 앞에 놓아 주세요" />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">결제수단</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {METHODS.map((item) => (
              <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === item ? "border-slate-900" : "border-slate-200"}`}>
                <input type="radio" name="method" checked={method === item} onChange={() => setMethod(item)} />
                {item}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">약관 동의</h2>
          <div className="mt-4 space-y-2">
            <Agree checked={finance} onChange={setFinance} required label="전자금융거래 이용약관" />
            <Agree checked={privacy} onChange={setPrivacy} required label="개인정보 수집 및 이용" />
            <Agree checked={purchase} onChange={setPurchase} required label="구매조건 및 결제 진행 동의" />
            <Agree checked={marketing} onChange={setMarketing} label="마케팅 정보 수신" />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {agreed ? "필수 약관에 동의했어요. 배송지와 결제수단을 고르면 결제할 수 있어요." : "필수 약관에 동의하면 결제하기 버튼이 켜져요."}
          </p>
        </section>

        {unavailable ? <p className="text-sm text-amber-700">판매 중이 아닌 상품은 결제할 수 없어요.</p> : null}
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" disabled={!canPay} className={`${primaryButtonClass} w-full sm:w-auto`}>
          {formatPrice(total)} 결제하기
        </button>
      </form>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "border-t border-slate-100 pt-2 font-semibold text-slate-900" : "text-slate-500"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Agree({ checked, onChange, label, required }: { checked: boolean; onChange: (value: boolean) => void; label: string; required?: boolean }) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4" />
      <span>
        <span className={required ? "mr-1 text-rose-500" : "mr-1 text-slate-400"}>{required ? "필수" : "선택"}</span>
        {label}
      </span>
    </label>
  );
}
