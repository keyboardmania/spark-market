import type { ChatRoom } from "@/data/mockData";

export function cloneChatRooms(source: ChatRoom[]): ChatRoom[] {
  return source.map((room) => ({
    ...room,
    purchase: room.purchase ? { ...room.purchase } : undefined,
    messages: room.messages.map((message) => ({ ...message })),
    listed: room.listed ?? true,
  }));
}

/** Removes at most one room. A bad id must not clear the rest of the inbox. */
export function dropRoom(rooms: ChatRoom[], roomId: string): ChatRoom[] {
  if (!roomId) return rooms;
  const index = rooms.findIndex((room) => room.id === roomId);
  if (index < 0) return rooms;
  return rooms.filter((_, roomIndex) => roomIndex !== index);
}

export function roomInInbox(room: ChatRoom) {
  if (room.listed === false) return false;
  if (room.listed === true) return true;
  return room.messages.some((message) => message.sender !== "system");
}
