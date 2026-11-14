import type { Metadata } from "next";
import { SEED_BOARDS } from "@/features/admin-boards/model";
import { BoardFeedView } from "@/features/support/boards/BoardFeedView";

export const metadata: Metadata = { title: "게시판" };
export const instant = false;

export function generateStaticParams() {
  return SEED_BOARDS.map((board) => ({ id: board.id }));
}

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoardFeedView id={id} />;
}
