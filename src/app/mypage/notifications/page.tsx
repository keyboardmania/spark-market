import type { Metadata } from "next";
import { AlertsPanel } from "@/components/spark/AlertsPanel";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "알림" };

export default function NotificationsPage() {
  return (
    <MyPageFrame>
      <AlertsPanel />
    </MyPageFrame>
  );
}
