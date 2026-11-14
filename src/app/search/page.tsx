import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResultsView } from "@/components/spark/SearchResultsView";

export const metadata: Metadata = { title: "검색" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <SearchResultsView />
    </Suspense>
  );
}
