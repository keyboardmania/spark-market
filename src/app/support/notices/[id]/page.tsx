import type { Metadata } from "next";
import { NOTICES } from "@/data/mockData";
import { NoticeDetailView } from "@/features/support/notices/NoticeDetailView";

export const metadata: Metadata = { title: "공지사항" };
export const instant = false;

export function generateStaticParams() {
  return NOTICES.map((item) => ({ id: item.id }));
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoticeDetailView id={id} />;
}
