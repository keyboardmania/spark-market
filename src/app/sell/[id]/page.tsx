import { Suspense } from "react";
import type { Metadata } from "next";
import { SellForm } from "@/components/spark/SellForm";

export const metadata: Metadata = { title: "상품 수정" };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-96 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <EditProductForm params={params} />
    </Suspense>
  );
}

async function EditProductForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SellForm productId={id} />;
}
