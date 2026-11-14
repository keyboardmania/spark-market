import type { Metadata } from "next";
import { ProductBrowseView } from "@/components/spark/ProductBrowseView";

export const metadata: Metadata = { title: "인기상품" };

export default function PopularProductsPage() {
  return <ProductBrowseView feed="popular" />;
}
