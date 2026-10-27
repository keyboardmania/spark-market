import type { Metadata } from "next";
import { MembersAdmin } from "@/components/spark/admin/MembersAdmin";

export const metadata: Metadata = { title: "회원 관리" };

export default function AdminMembersPage() {
  return <MembersAdmin />;
}
