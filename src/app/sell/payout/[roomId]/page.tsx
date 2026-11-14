import type { Metadata } from "next";
import { CHAT_ROOMS } from "@/data/mockData";
import { SellerPayoutView } from "@/features/seller-payout/SellerPayoutView";

export const metadata: Metadata = { title: "정산 정보" };
export const instant = false;

export function generateStaticParams() {
  return CHAT_ROOMS.map((room) => ({ roomId: room.id }));
}

export default async function SellerPayoutPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <SellerPayoutView roomId={roomId} />;
}
