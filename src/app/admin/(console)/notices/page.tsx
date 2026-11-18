import type { Metadata } from "next";
import { NoticesAdmin } from "@/components/spark/admin/NoticesAdmin";

export const metadata: Metadata = { title: "공지사항 관리" };

export default function AdminNoticesPage() {
  return <NoticesAdmin />;
}
