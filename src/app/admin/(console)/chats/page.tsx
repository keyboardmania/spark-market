import type { Metadata } from "next";
import { ChatsAdmin } from "@/components/spark/admin/ChatsAdmin";

export const metadata: Metadata = { title: "채팅 관리" };

export default function AdminChatsPage() {
  return <ChatsAdmin />;
}
