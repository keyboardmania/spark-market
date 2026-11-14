import type { Metadata } from "next";
import { WithdrawPanel } from "@/components/spark/AccountPanels";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "회원 탈퇴" };

export default function WithdrawPage() {
  return (
    <MyPageFrame>
      <WithdrawPanel />
    </MyPageFrame>
  );
}
