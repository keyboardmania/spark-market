import type { Metadata } from "next";
import { PasswordPanel } from "@/components/spark/AccountPanels";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "비밀번호" };

export default function PasswordPage() {
  return (
    <MyPageFrame>
      <PasswordPanel />
    </MyPageFrame>
  );
}
