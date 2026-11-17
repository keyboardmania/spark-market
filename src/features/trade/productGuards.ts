import type { ChatRoom, Order, Product, SaleStatus } from "@/data/mockData";

export const DELETE_BLOCKED_MESSAGE =
  "현재 거래 진행 중이거나 예약 중인 상품은 상태를 변경한 후 삭제할 수 있습니다.";

const IN_TRANSACTION = new Set(["승인", "결제완료"]);

export function productDeleteBlock(
  product: Pick<Product, "id" | "saleStatus">,
  rooms: Pick<ChatRoom, "productId" | "purchase">[],
  _orders: Pick<Order, "productId" | "status">[],
): string | null {
  if (product.saleStatus === "예약중" || product.saleStatus === "판매완료") return DELETE_BLOCKED_MESSAGE;
  const inTransaction = rooms.some(
    (room) => room.productId === product.id && !!room.purchase && IN_TRANSACTION.has(room.purchase.status),
  );
  if (inTransaction) return DELETE_BLOCKED_MESSAGE;
  return null;
}

export function pendingPurchaseRooms<T extends { id: string; productId: string; purchase?: { status: string } }>(
  productId: string,
  rooms: T[],
) {
  return rooms.filter((room) => room.productId === productId && room.purchase?.status === "대기");
}

export function saleStatusLabel(status: SaleStatus) {
  return status === "판매완료" ? `${status}로` : `${status}으로`;
}
