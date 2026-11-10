import type { Metadata } from "next";
import { ReviewDetailView } from "@/components/spark/ReviewDetailView";
import { REVIEWS } from "@/data/mockData";

export const metadata: Metadata = { title: "리뷰" };

export function generateStaticParams() {
  return REVIEWS.map((review) => ({ id: review.id }));
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewDetailView id={id} />;
}
