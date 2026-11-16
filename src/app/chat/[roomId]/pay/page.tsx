import type { Metadata } from "next";
import { CHAT_ROOMS } from "@/data/mockData";
import { PurchaseAcceptView } from "@/features/trade/PurchaseAcceptView";

export const metadata: Metadata = { title: "구매 수락" };
export const instant = false;

export function generateStaticParams() {
  return CHAT_ROOMS.map((room) => ({ roomId: room.id }));
}

export default async function PurchaseAcceptPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <PurchaseAcceptView roomId={roomId} />;
}
