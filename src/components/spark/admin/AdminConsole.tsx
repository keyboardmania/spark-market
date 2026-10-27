"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";

const NAV = [
  { href: "/admin", label: "대시보드 홈", exact: true },
  { href: "/admin/products", label: "상품/카테고리 관리" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/trades", label: "거래 & 정산 관리" },
  { href: "/admin/support", label: "고객센터 & 신고 관리" },
] as const;

export function AdminConsole({ children }: { children: ReactNode }) {
  const { ready, session } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!ready || session || pathname === "/admin/login") return;
    router.replace("/admin/login");
  }, [ready, session, pathname, router]);

  if (!ready) {
    return <p className="grid min-h-dvh place-items-center bg-slate-50 text-sm text-slate-400">세션을 확인하고 있어요.</p>;
  }

  if (!session) {
    return <p className="grid min-h-dvh place-items-center bg-slate-50 text-sm text-slate-400">관리자 로그인으로 이동하고 있어요.</p>;
  }

  return <AdminFrame>{children}</AdminFrame>;
}

function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, inquiries, reports } = useAdmin();
  const openCount = inquiries.filter((item) => item.status === "미답변").length + reports.filter((item) => item.status === "접수" || item.status === "처리중").length;

  function signOut() {
    logout();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-slate-50/50 md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-white md:min-h-dvh md:border-b-0 md:border-r">
        <div className="flex items-end gap-2 px-5 py-5">
          <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-rose-300" />
          <Link href="/admin" className="font-serif text-[1.6rem] leading-none tracking-[-0.04em] text-slate-900">
            Spark
          </Link>
          <span className="mb-0.5 text-[11px] font-medium tracking-[0.16em] text-slate-400">ADMIN</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:px-3 md:pb-6" aria-label="관리자 메뉴">
          {NAV.map((item) => {
            const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-full px-3 py-2.5 text-sm md:rounded-xl ${active ? "bg-slate-900 font-medium text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <span>{item.label}</span>
                {item.href === "/admin/support" && openCount > 0 ? (
                  <span className={`rounded-full px-1.5 text-[10px] leading-4 ${active ? "bg-white text-slate-900" : "bg-rose-400 text-white"}`}>{openCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 sm:px-6">
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{session?.name}</span>
            <span className="mx-2 text-slate-300">·</span>
            {session?.role}
          </p>
          <div className="flex items-center gap-2">
            <Link href="/" className="rounded-full px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
              상점 보기
            </Link>
            <button type="button" onClick={signOut} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              로그아웃
            </button>
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
