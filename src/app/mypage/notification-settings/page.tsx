import type { Metadata } from "next";
import { NotificationSettingsPanel } from "@/components/spark/AlertsPanel";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "알림 수신 설정" };

export default function NotificationSettingsPage() {
  return (
    <MyPageFrame>
      <NotificationSettingsPanel />
    </MyPageFrame>
  );
}
