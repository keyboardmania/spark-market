import type { Metadata } from "next";
import { SupportAdmin } from "@/components/spark/admin/SupportAdmin";

export const metadata: Metadata = { title: "고객센터 & 신고 관리" };

export default function AdminSupportPage() {
  return <SupportAdmin />;
}
