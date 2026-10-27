import type { Metadata } from "next";
import { AdminLogin } from "@/components/spark/admin/AdminLogin";

export const metadata: Metadata = { title: "관리자 로그인" };

export default function AdminLoginPage() {
  return <AdminLogin />;
}
