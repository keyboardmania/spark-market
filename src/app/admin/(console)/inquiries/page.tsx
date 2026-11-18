import type { Metadata } from "next";
import { InquiriesAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "문의 관리" };

export default function AdminInquiriesPage() {
  return <InquiriesAdmin />;
}
