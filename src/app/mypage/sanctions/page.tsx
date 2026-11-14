import type { Metadata } from "next";
import { MyPageFrame, SanctionsPanel } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "제재 내역" };

export default function SanctionsPage() {
  return (
    <MyPageFrame>
      <SanctionsPanel />
    </MyPageFrame>
  );
}
