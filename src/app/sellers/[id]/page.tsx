import { Suspense } from "react";
import type { Metadata } from "next";
import { SellerProfileView } from "@/components/spark/SellerProfileView";
import { SELLERS, findSeller } from "@/data/mockData";

export function generateStaticParams() {
  return SELLERS.map((seller) => ({ id: seller.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: findSeller(id)?.name ?? "프로필" };
}

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-8"><div className="h-80 animate-pulse rounded-2xl bg-slate-100" /></div>}>
      <SellerProfileView id={id} />
    </Suspense>
  );
}
