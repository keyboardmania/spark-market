import type { Metadata } from "next";
import { AlarmDeskView } from "@/features/admin-alarms/AlarmDeskView";

export const metadata: Metadata = { title: "알림 관리" };

export default function AdminAlarmsPage() {
  return <AlarmDeskView />;
}
