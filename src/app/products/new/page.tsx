import type { Metadata } from "next";
import { ProductBrowseView } from "@/components/spark/ProductBrowseView";

export const metadata: Metadata = { title: "신상품" };

export default function NewProductsPage() {
  return <ProductBrowseView feed="new" />;
}
