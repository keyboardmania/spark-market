import type { ReactNode } from "react";
import { AdminConsole } from "@/components/spark/admin/AdminConsole";

export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return <AdminConsole>{children}</AdminConsole>;
}
