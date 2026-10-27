import type { Metadata } from "next";
import { ChatScreen } from "@/components/spark/ChatScreen";

export const metadata: Metadata = { title: "1:1 채팅" };

export default function ChatPage() {
  return <ChatScreen />;
}
