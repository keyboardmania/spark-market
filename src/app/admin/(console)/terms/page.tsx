import type { Metadata } from "next";
import { TermsAdmin } from "@/components/spark/admin/ContentAdmin";

export const metadata: Metadata = { title: "약관 관리" };

export default function AdminTermsPage() {
  return <TermsAdmin />;
}
