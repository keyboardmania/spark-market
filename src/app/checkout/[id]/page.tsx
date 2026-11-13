import { redirect } from "next/navigation";
import { PRODUCTS } from "@/data/mockData";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/products/${id}`);
}
