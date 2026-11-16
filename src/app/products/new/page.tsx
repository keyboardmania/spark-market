import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductBrowseView } from "@/components/spark/ProductBrowseView";

export const metadata: Metadata = { title: "신상품" };

export default function NewProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <ProductBrowseView feed="new" />
    </Suspense>
  );
}
