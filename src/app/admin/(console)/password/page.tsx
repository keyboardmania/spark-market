import type { Metadata } from "next";
import { AdminPassword } from "@/components/spark/admin/AdminPassword";

export const metadata: Metadata = { title: "관리자 비밀번호 변경" };

export default function AdminPasswordPage() {
  return <AdminPassword />;
}
