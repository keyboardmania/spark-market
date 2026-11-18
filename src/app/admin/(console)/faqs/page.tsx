import type { Metadata } from "next";
import { FaqsAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "FAQ 관리" };

export default function AdminFaqsPage() {
  return <FaqsAdmin />;
}
