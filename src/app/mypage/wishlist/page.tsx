import type { Metadata } from "next";
import { MyPageFrame, WishlistPanel } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "찜한 상품" };

export default function WishlistPage() {
  return (
    <MyPageFrame>
      <WishlistPanel />
    </MyPageFrame>
  );
}
