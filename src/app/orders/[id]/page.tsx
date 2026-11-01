import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderDetailView } from "@/components/spark/OrderDetailView";
import { ORDERS } from "@/data/mockData";

export function generateStaticParams() {
  return ORDERS.map((order) => ({ id: order.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const order = ORDERS.find((item) => item.id === id);
  return { title: order?.title ?? "주문 상세" };
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      }
    >
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailView id={id} />;
}
