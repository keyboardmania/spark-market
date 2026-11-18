import type { Metadata } from "next";
import { NotificationInboxPanel } from "@/components/spark/AlertsPanel";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "알림함" };

export default function NotificationInboxPage() {
  return (
    <MyPageFrame>
      <NotificationInboxPanel />
    </MyPageFrame>
  );
}
