import type { Metadata } from "next";
import { BankPanel } from "@/components/spark/AccountPanels";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "계좌 관리" };

export default function AccountsPage() {
  return (
    <MyPageFrame>
      <BankPanel />
    </MyPageFrame>
  );
}
