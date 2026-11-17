import type { Metadata } from "next";
import { ReviewsPanel } from "@/components/spark/AccountPanels";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "받은 리뷰" };

export default function ReviewsPage() {
  return (
    <MyPageFrame>
      <ReviewsPanel />
    </MyPageFrame>
  );
}
