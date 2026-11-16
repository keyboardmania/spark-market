import type { ChatRoom, Order, Product, SaleStatus } from "@/data/mockData";

export const DELETE_BLOCKED_MESSAGE =
  "현재 거래 진행 중이거나 예약 중인 상품은 상태를 변경한 후 삭제할 수 있습니다.";

const LIVE_PURCHASE = new Set(["대기", "승인", "결제완료"]);
const CLOSED_ORDER = new Set(["구매확정", "거래취소"]);

export function productDeleteBlock(
  product: Pick<Product, "id" | "saleStatus">,
  rooms: Pick<ChatRoom, "productId" | "purchase">[],
  orders: Pick<Order, "productId" | "status">[],
): string | null {
  if (product.saleStatus === "판매완료") return null;
  const reserved = product.saleStatus === "예약중";
  const interacting = rooms.some(
    (room) => room.productId === product.id && !!room.purchase && LIVE_PURCHASE.has(room.purchase.status),
  );
  const openOrder = orders.some((order) => order.productId === product.id && !CLOSED_ORDER.has(order.status));
  if (reserved || interacting || openOrder) return DELETE_BLOCKED_MESSAGE;
  return null;
}

export function saleStatusLabel(status: SaleStatus) {
  return status === "판매완료" ? `${status}로` : `${status}으로`;
}
