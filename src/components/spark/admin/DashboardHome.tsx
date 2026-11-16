"use client";

import Link from "next/link";
import { ADMIN_TODAY, formatPrice } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { reportTimestamp, useShared } from "@/data/shared";
import { DataTable, Panel, StatCard, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

const HOME_LIST_LIMIT = 5;

export function DashboardHome() {
  const { trades, members, inquiries } = useAdmin();
  const reports = useShared().reports;
  const todaySales = trades
    .filter((trade) => trade.orderedAt === ADMIN_TODAY && trade.status !== "거래취소")
    .reduce((sum, trade) => sum + trade.amount, 0);
  const newMembers = members.filter((member) => member.joinedAt === ADMIN_TODAY).length;
  const openInquiryItems = inquiries.filter((item) => item.status === "미답변");
  const openReportItems = reports.filter((item) => item.status === "접수" || item.status === "검토");
  const openInquiries = openInquiryItems.length;
  const openReports = openReportItems.length;
  const todayTrades = trades
    .filter((trade) => trade.orderedAt === ADMIN_TODAY)
    .slice()
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, HOME_LIST_LIMIT);
  const latestReports = openReportItems
    .slice()
    .sort((a, b) => reportTimestamp(b.createdAt) - reportTimestamp(a.createdAt))
    .slice(0, HOME_LIST_LIMIT);
  const latestInquiries = openInquiryItems
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, HOME_LIST_LIMIT);

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
        <StatCard label="미처리 신고" value={`${openReports}건`} hint="접수·검토 상태인 신고" />
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
              {todayTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-slate-50">
                  <td className={tdClass}>
                    <Link href="/admin/trades" className="block text-slate-900">
                      <span className="block">{trade.title}</span>
                      <span className="text-xs text-slate-400">{trade.id}</span>
                    </Link>
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{formatPrice(trade.amount)}</td>
                  <td className={tdClass}>
                    <StatusPill>{trade.status}</StatusPill>
                  </td>
                </tr>
              ))}
              {todayTrades.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-400`} colSpan={3}>
                    오늘 거래가 없어요.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </DataTable>
        </Panel>
        <div className="space-y-4">
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
              {latestReports.map((report) => (
                <li key={report.id} className="border-t border-slate-100 first:border-t-0">
                  <Link href="/admin/support" className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                    <CompactSummary author={report.reporter} category={report.category} />
                    <StatusPill tone="rose">{report.status}</StatusPill>
                  </Link>
                </li>
              ))}
              {latestReports.length === 0 ? <li className="px-4 py-6 text-sm text-slate-400">처리가 필요한 신고가 없어요.</li> : null}
            </ul>
          </Panel>
          <Panel
            title="처리가 필요한 문의"
            flush
            action={
              <Link href="/admin/desk" className="text-xs text-slate-400 hover:text-slate-700">
                문의 관리
              </Link>
            }
          >
            <ul>
              {latestInquiries.map((inquiry) => (
                <li key={inquiry.id} className="border-t border-slate-100 first:border-t-0">
                  <Link href="/admin/desk" className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50">
                    <CompactSummary author={inquiry.member} category={inquiry.category} />
                    <StatusPill tone="rose">{inquiry.status}</StatusPill>
                  </Link>
                </li>
              ))}
              {latestInquiries.length === 0 ? <li className="px-4 py-6 text-sm text-slate-400">처리가 필요한 문의가 없어요.</li> : null}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function CompactSummary({ author, category }: { author: string; category: string }) {
  return (
    <p className="min-w-0 truncate text-sm text-slate-900">
      <span className="font-medium">{author}</span>
      <span className="text-slate-300"> · </span>
      <span>{category}</span>
    </p>
  );
}

