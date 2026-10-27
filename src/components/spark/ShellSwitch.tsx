"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/spark/SiteFooter";
import { SiteHeader } from "@/components/spark/SiteHeader";

export function ShellSwitch({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");

  if (admin) {
    return <div className="min-h-full bg-slate-50/50">{children}</div>;
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
