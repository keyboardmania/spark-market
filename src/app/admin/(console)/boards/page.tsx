import type { Metadata } from "next";
import { BoardDeskView } from "@/features/admin-boards/BoardDeskView";

export const metadata: Metadata = { title: "게시판 관리" };

export default function AdminBoardsPage() {
  return <BoardDeskView />;
}
