import type { Metadata } from "next";
import { CheckoutView } from "@/components/spark/CheckoutView";
import { PRODUCTS, getProductById } from "@/data/mockData";

export const metadata: Metadata = { title: "결제" };

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckoutView id={id} initialProduct={getProductById(id)} />;
}
