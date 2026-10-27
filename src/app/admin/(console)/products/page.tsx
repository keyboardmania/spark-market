import type { Metadata } from "next";
import { ProductsAdmin } from "@/components/spark/admin/ProductsAdmin";

export const metadata: Metadata = { title: "상품/카테고리 관리" };

export default function AdminProductsPage() {
  return <ProductsAdmin />;
}
