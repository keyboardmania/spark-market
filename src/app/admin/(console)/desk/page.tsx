import type { Metadata } from "next";
import { ContentAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "문의·공지·FAQ·약관 관리" };

export default function AdminDeskPage() {
  return <ContentAdmin />;
}
