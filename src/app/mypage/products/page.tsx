import type { Metadata } from "next";
import { MyListingsView } from "@/components/spark/MyListingsView";

export const metadata: Metadata = { title: "내 상품 관리" };

export default function MyProductsPage() {
  return <MyListingsView />;
}
