import type { Metadata } from "next";
import { DashboardHome } from "@/components/spark/admin/DashboardHome";

export const metadata: Metadata = { title: "관리자 대시보드" };

export default function AdminHomePage() {
  return <DashboardHome />;
}
