import type { Metadata } from "next";
import { MyPageView } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "마이페이지" };

export default function MyPage() {
  return <MyPageView />;
}
