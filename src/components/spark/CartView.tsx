"use client";

import Link from "next/link";
import { formatPrice } from "@/data/mockData";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function CartView() {
  const mounted = useMounted();
  const { cartIds, products, removeFromCart } = useSpark();

  if (!mounted) {
    return <div className="mx-auto max-w-3xl px-4 py-8"><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  }

  const items = cartIds.map((id) => products.find((product) => product.id === id)).filter((item) => item !== undefined);
  const total = items.reduce((sum, item) => sum + item.price + item.shippingFee, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">장바구니</h1>
      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 px-4 py-16 text-center">
          <p className="text-sm text-slate-400">담긴 상품이 없어요.</p>
          <Link href="/" className={`${ghostButtonClass} mt-5`}>매물 보러 가기</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-slate-200 p-3">
              <ProductVisual motif={item.motif} palette={item.palette} ip={item.ip} uid={`cart-${item.id}`} imageUrl={item.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <Link href={`/products/${item.id}`} className="text-sm font-medium text-slate-900">{item.title}</Link>
                <p className="mt-1 text-sm tabular-nums text-slate-500">{formatPrice(item.price)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => removeFromCart(item.id)} className="text-xs text-slate-400 underline">빼기</button>
                  <Link href={`/checkout/${item.id}`} className={primaryButtonClass}>구매하기</Link>
                </div>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between px-1 pt-2 text-sm">
            <span className="text-slate-500">배송비 포함 합계</span>
            <span className="text-lg font-semibold tabular-nums">{formatPrice(total)}</span>
          </li>
        </ul>
      )}
    </div>
  );
}
