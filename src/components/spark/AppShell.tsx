import { Suspense, type ReactNode } from "react";
import { ShellSwitch } from "@/components/spark/ShellSwitch";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col bg-white">
          <div className="h-[108px] border-b border-slate-100 bg-white" />
          <main className="flex-1">{children}</main>
        </div>
      }
    >
      <ShellSwitch>{children}</ShellSwitch>
    </Suspense>
  );
}
