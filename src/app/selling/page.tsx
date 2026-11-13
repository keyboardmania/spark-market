import { Suspense } from "react";
import type { Metadata } from "next";
import { SalesManageView } from "@/components/spark/SalesManageView";

export const metadata: Metadata = { title: "판매 관리" };

export default function SellingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <SalesManageView />
    </Suspense>
  );
}
