import type { Metadata } from "next";
import { OperatorsAdmin } from "@/components/spark/admin/OperatorsAdmin";

export const metadata: Metadata = { title: "운영자 계정 관리" };

export default function AdminOperatorsPage() {
  return <OperatorsAdmin />;
}
