import type { Metadata } from "next";
import { NoticesAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "공지사항 관리" };

export default function AdminNoticesPage() {
  return <NoticesAdmin />;
}
