import type { Metadata } from "next";
import { ProfileForm } from "@/components/spark/AccountPanels";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "회원 정보" };

export default function ProfilePage() {
  return (
    <MyPageFrame>
      <ProfileForm />
    </MyPageFrame>
  );
}
