"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatPrice, needsCustomsNumber } from "@/data/mockData";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useI18n } from "@/features/i18n/useI18n";
import { PAYMENT_METHOD_IDS, fill, paymentMethodLabel, paymentMethodStored, type PaymentMethodId } from "@/features/i18n/ui";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";
import { QuickFill } from "@/features/wireframe/QuickFill";
import { QUICK_CUSTOMS } from "@/features/wireframe/demoProfile";

export function PurchaseAcceptView({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const { rooms, products, addresses, tradeRole, completePurchase, isProductDeleted } = useSpark();
  const room = rooms.find((item) => item.id === roomId) ?? null;
  const product = room && !isProductDeleted(room.productId) ? products.find((item) => item.id === room.productId) ?? null : null;
  const fallback = addresses.find((item) => item.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState(fallback?.id ?? "");
  const [method, setMethod] = useState<PaymentMethodId | "">("");
  const [terms, setTerms] = useState(false);
  const [customsNumber, setCustomsNumber] = useState("");
  const back = `/chat/${roomId}`;

  if (!room || !product) {
    return (
      <WireframeFrame eyebrow="PAY" title={t("payTitle")} backHref="/chat" backLabel={t("payBack")}>
        <p className="text-sm text-slate-500">{t("payMissing")}</p>
      </WireframeFrame>
    );
  }

  const listing = product;
  const approved = room.purchase?.status === "승인";
  const buyer = tradeRole === "buyer";
  const selected = addresses.find((item) => item.id === addressId) ?? null;
  const destination = selected ? `${selected.address} ${selected.detail}`.trim() : "";
  const showCustoms = Boolean(selected) && needsCustomsNumber(product, destination);
  const ready = Boolean(buyer && approved && selected && method && terms && (!showCustoms || customsNumber.trim()));
  const total = product.price + (product.shippingIncluded || product.shippingFee === 0 ? 0 : product.shippingFee);

  function fillSample() {
    if (fallback) setAddressId(fallback.id);
    setMethod("card");
    setTerms(true);
    const nextDestination = fallback ? `${fallback.address} ${fallback.detail}`.trim() : "";
    if (fallback && needsCustomsNumber(listing, nextDestination)) setCustomsNumber(QUICK_CUSTOMS);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || !selected || !method) return;
    const orderId = completePurchase(roomId, {
      address: `${selected.name} · ${selected.phone} · (${selected.postalCode}) ${selected.address} ${selected.detail}`,
      customsNumber: showCustoms ? customsNumber.trim() : "",
      paymentMethod: paymentMethodStored(method),
    });
    if (!orderId) return;
    window.sessionStorage.setItem("spark-return-room", roomId);
    router.replace(back);
  }

  return (
    <WireframeFrame eyebrow="PAY" title={t("payTitle")} lede={product.title} backHref={back} backLabel={t("payBack")}>
      <form className="flex flex-col gap-5" onSubmit={submit}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-slate-500">{t("payLede")}</p>
          <QuickFill onFill={fillSample} />
        </div>
        {!buyer ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950">{t("payNotBuyer")}</p> : null}
        {!approved ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{t("payNotApproved")}</p> : null}

        <fieldset>
          <legend className="text-xs font-medium text-slate-500">{t("payShip")}</legend>
          {addresses.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
              {t("payNoAddress")}{" "}
              <Link href="/mypage/addresses" className="font-medium text-slate-900 underline">{t("payAddressBook")}</Link>{" "}
              {t("payAddressAuto")}
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {addresses.map((item) => (
                <label key={item.id} className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 text-sm ${addressId === item.id ? "border-slate-900" : "border-slate-200"}`}>
                  <input type="radio" name="shipping-address" className="mt-1" checked={addressId === item.id} onChange={() => setAddressId(item.id)} />
                  <span>
                    <span className="block font-medium text-slate-900">
                      {item.name}
                      {item.isDefault ? <span className="ml-2 text-xs font-normal text-slate-400">{t("payDefault")}</span> : null}
                    </span>
                    <span className="mt-1 block leading-5 text-slate-500">
                      {item.name} · {item.phone} · ({item.postalCode}) {item.address} {item.detail}
                    </span>
                  </span>
                </label>
              ))}
              <Link href="/mypage/addresses" className="inline-block text-xs font-medium text-slate-500 underline">{t("payChangeAddress")}</Link>
            </div>
          )}
        </fieldset>

        {showCustoms ? (
          <label className="block space-y-2 text-xs text-slate-500">
            {t("payCustoms")}
            <input value={customsNumber} onChange={(event) => setCustomsNumber(event.target.value)} placeholder={t("payCustomsPh")} className={fieldClass} />
            <span className="block leading-5 text-slate-400">{t("payCustomsHint")}</span>
          </label>
        ) : null}

        <fieldset>
          <legend className="text-xs font-medium text-slate-500">{t("payMethod")}</legend>
          <div className="mt-2 grid gap-2">
            {PAYMENT_METHOD_IDS.map((id) => (
              <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${method === id ? "border-slate-900 font-medium" : "border-slate-200"}`}>
                <input type="radio" name="payment-method" checked={method === id} onChange={() => setMethod(id)} />
                {paymentMethodLabel(t, id)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-1" />
          <span>
            <Link href="/legal/terms" className="underline">{t("payTermsBefore")}</Link> {t("payTermsAfter")}
          </span>
        </label>

        <p className="text-sm font-semibold text-slate-900">{t("payAmount")} {formatPrice(total)}</p>
        <div className="flex gap-2">
          <Link href={back} className={ghostButtonClass}>{t("payBack")}</Link>
          <button type="submit" disabled={!ready} className={primaryButtonClass}>
            {fill(t("paySubmit"), {})} · {formatPrice(total)}
          </button>
        </div>
      </form>
    </WireframeFrame>
  );
}
