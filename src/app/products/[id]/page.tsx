import type { Metadata } from "next";
import { ProductDetailView } from "@/components/spark/ProductDetailView";
import { PRODUCTS, getProductById } from "@/data/mockData";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product?.title ?? "상품" };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailView id={id} initialProduct={getProductById(id)} />;
}
