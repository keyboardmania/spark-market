import type { Metadata } from "next";
import { USER_INQUIRIES } from "@/data/mockData";
import { InquiryDetailView } from "@/features/support/inquiries/InquiryDetailView";

export const metadata: Metadata = { title: "문의 상세" };
export const instant = false;

export function generateStaticParams() {
  return USER_INQUIRIES.map((item) => ({ id: item.id }));
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InquiryDetailView id={id} />;
}
