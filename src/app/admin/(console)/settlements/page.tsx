import type { Metadata } from "next";
import { SettlementsAdmin } from "@/components/spark/admin/SettlementsAdmin";

export const metadata: Metadata = { title: "정산 관리" };

export default function AdminSettlementsPage() {
  return <SettlementsAdmin />;
}
