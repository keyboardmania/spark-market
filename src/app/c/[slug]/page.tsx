import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketView } from "@/components/spark/MarketView";
import { CATEGORY_ROUTES, categoryFromSlug } from "@/data/mockData";

export function generateStaticParams() {
  return CATEGORY_ROUTES.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: categoryFromSlug(slug) ?? "카테고리" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  return <MarketView category={category} />;
}
