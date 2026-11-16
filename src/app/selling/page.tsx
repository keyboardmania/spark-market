import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "판매 내역" };

export default async function SellingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  params.set("tab", "sale");
  const status = firstQuery(query.status);
  const page = firstQuery(query.page);
  if (status) params.set("filter", status === "OPEN" ? "SHIPPING" : status === "DONE" ? "SETTLED" : status);
  if (page && page !== "1") params.set("page", page);
  redirect(`/orders?${params.toString()}`);
}

function firstQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
