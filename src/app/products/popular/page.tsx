import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductBrowseView } from "@/components/spark/ProductBrowseView";

export const metadata: Metadata = { title: "인기상품" };

export default function PopularProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <ProductBrowseView feed="popular" />
    </Suspense>
  );
}
