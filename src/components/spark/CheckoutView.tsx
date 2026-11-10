"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/mockData";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function CheckoutView({ id, initialProduct }: { id: string; initialProduct: Product | null }) {
  const router = useRouter();
  const mounted = useMounted();
  const { products, ensureRoom, isProductDeleted } = useSpark();
  const deleted = mounted && isProductDeleted(id);
  const live = products.find((product) => product.id === id);
  const product = deleted ? undefined : mounted ? (live ?? initialProduct) : initialProduct;

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

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">결제는 채팅에서 진행해요</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        구매 신청 후 판매자가 승인하면 결제 정보를 입력합니다. 결제 완료 시 PG 예치와 상품 금액이 고정되고, 상품은 예약중이 됩니다.
      </p>
      <button
        type="button"
        className={`${primaryButtonClass} mt-6`}
        onClick={() => {
          const roomId = ensureRoom(product);
          if (roomId) router.push(`/chat/${roomId}`);
        }}
      >
        1:1 채팅 열기
      </button>
    </div>
  );
}
