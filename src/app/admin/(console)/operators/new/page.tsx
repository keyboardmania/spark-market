import type { Metadata } from "next";
import { OperatorCreate } from "@/components/spark/admin/OperatorCreate";

export const metadata: Metadata = { title: "운영자 등록" };

/** `/admin/operators/new` — 운영자 등록 폼 */
export default function AdminOperatorCreatePage() {
  return <OperatorCreate />;
}
