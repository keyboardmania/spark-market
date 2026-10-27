import type { Metadata } from "next";
import { TradesAdmin } from "@/components/spark/admin/TradesAdmin";

export const metadata: Metadata = { title: "거래 & 정산 관리" };

export default function AdminTradesPage() {
  return <TradesAdmin />;
}
