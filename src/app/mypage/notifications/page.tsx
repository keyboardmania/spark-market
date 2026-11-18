import { Suspense } from "react";
import type { Metadata } from "next";
import { AlertsPanel } from "@/components/spark/AlertsPanel";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "알림" };

export default function NotificationsPage() {
  return (
    <MyPageFrame>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}>
        <AlertsPanel />
      </Suspense>
    </MyPageFrame>
  );
}
