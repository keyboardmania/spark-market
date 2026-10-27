"use client";

import Link from "next/link";
import { ADMIN_TODAY, formatPrice } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { DataTable, Panel, StatCard, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function DashboardHome() {
  const { trades, members, inquiries, reports } = useAdmin();
  const todaySales = trades
    .filter((trade) => trade.orderedAt === ADMIN_TODAY && trade.status !== "거래취소")
    .reduce((sum, trade) => sum + trade.amount, 0);
  const newMembers = members.filter((member) => member.joinedAt === ADMIN_TODAY).length;
  const openInquiries = inquiries.filter((item) => item.status === "미답변").length;
  const openReports = reports.filter((item) => item.status === "접수" || item.status === "처리중").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">OVERVIEW</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">대시보드 홈</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="오늘 거래액" value={formatPrice(todaySales)} hint={`${ADMIN_TODAY} 결제 기준, 취소 제외`} />
        <StatCard label="신규 가입자" value={`${newMembers}명`} hint="오늘 가입한 회원" />
        <StatCard label="미처리 문의" value={`${openInquiries}건`} hint="답변이 필요한 1:1 문의" />
        <StatCard label="미처리 신고" value={`${openReports}건`} hint="접수 · 처리중 신고" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          title="오늘 거래"
          flush
          action={
            <Link href="/admin/trades" className="text-xs text-slate-400 hover:text-slate-700">
              거래 관리
            </Link>
          }
        >
          <DataTable wide={false}>
            <thead>
              <tr>
                <th className={thClass}>주문</th>
                <th className={thClass}>금액</th>
                <th className={thClass}>상태</th>
              </tr>
            </thead>
            <tbody>
              {trades
                .filter((trade) => trade.orderedAt === ADMIN_TODAY)
                .map((trade) => (
                  <tr key={trade.id}>
                    <td className={tdClass}>
                      <span className="block text-slate-900">{trade.title}</span>
                      <span className="text-xs text-slate-400">{trade.id}</span>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{formatPrice(trade.amount)}</td>
                    <td className={tdClass}>
                      <StatusPill>{trade.status}</StatusPill>
                    </td>
                  </tr>
                ))}
            </tbody>
          </DataTable>
        </Panel>
        <Panel
          title="처리가 필요한 신고"
          flush
          action={
            <Link href="/admin/support" className="text-xs text-slate-400 hover:text-slate-700">
              신고 관리
            </Link>
          }
        >
          <ul>
            {reports
              .filter((report) => report.status === "접수" || report.status === "처리중")
              .map((report) => (
                <li key={report.id} className="flex items-start justify-between gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0">
                  <div>
                    <p className="text-sm text-slate-900">{report.targetLabel}</p>
                    <p className="mt-1 text-xs text-slate-400">{report.reason}</p>
                  </div>
                  <StatusPill tone={report.status === "접수" ? "rose" : "amber"}>{report.status}</StatusPill>
                </li>
              ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
