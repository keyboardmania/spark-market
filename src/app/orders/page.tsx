import { Suspense } from "react";
import type { Metadata } from "next";
import { OrdersView } from "@/components/spark/OrdersView";

export const metadata: Metadata = { title: "구매/판매 내역" };

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-8"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <OrdersView />
    </Suspense>
  );
}
