import type { Metadata } from "next";
import { OperatorCreate } from "@/components/spark/admin/OperatorCreate";

export const metadata: Metadata = { title: "운영자 등록" };

export default function AdminOperatorCreatePage() {
  return <OperatorCreate />;
}
