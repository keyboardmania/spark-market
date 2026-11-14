import type { Metadata } from "next";
import { FAQS } from "@/data/mockData";
import { FaqDetailView } from "@/features/support/faq/FaqDetailView";

export const metadata: Metadata = { title: "FAQ" };
export const instant = false;

export function generateStaticParams() {
  return FAQS.map((item) => ({ id: item.id }));
}

export default async function FaqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FaqDetailView id={id} />;
}
