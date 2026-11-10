import type { Metadata } from "next";
import { ReviewsAdmin } from "@/components/spark/admin/ReviewsAdmin";

export const metadata: Metadata = { title: "리뷰 관리" };

export default function AdminReviewsPage() {
  return <ReviewsAdmin />;
}
