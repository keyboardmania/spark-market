import { Suspense } from "react";
import type { Metadata } from "next";
import { TermsDetailAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "약관 상세" };

export default function AdminTermDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-100" />}>
      <AdminTermDetailContent params={params} />
    </Suspense>
  );
}

async function AdminTermDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TermsDetailAdmin termId={id} />;
}
