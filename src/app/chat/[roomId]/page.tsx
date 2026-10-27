import type { Metadata } from "next";
import { ChatScreen } from "@/components/spark/ChatScreen";
import { CHAT_ROOMS } from "@/data/mockData";

export const metadata: Metadata = { title: "1:1 채팅" };

export function generateStaticParams() {
  return CHAT_ROOMS.map((room) => ({ roomId: room.id }));
}

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <ChatScreen initialRoomId={roomId} />;
}
