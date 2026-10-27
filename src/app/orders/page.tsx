import type { Metadata } from "next";
import { OrdersView } from "@/components/spark/OrdersView";

export const metadata: Metadata = { title: "구매/판매 내역" };

export default function OrdersPage() {
  return <OrdersView />;
}
