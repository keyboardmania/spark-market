import type { ReactNode } from "react";
import { AdminProvider } from "@/components/spark/AdminProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminProvider>{children}</AdminProvider>;
}
