"use client";

import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import type { AlarmHistoryRecord } from "@/features/admin-alarms/model";

export function AlarmHistoryList({ history }: { history: AlarmHistoryRecord[] }) {
  const sorted = history.slice().sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  const page = useAdminPage(sorted.length, sorted.map((item) => item.id).join(","));
  const rows = sorted.slice(page.start, page.start + page.pageSize);

  return (
    <>
      <DataTable>
        <thead>
          <tr>
            <th className={thClass}>발송 시각</th>
            <th className={thClass}>알림 종류</th>
            <th className={thClass}>수신자</th>
            <th className={thClass}>제목</th>
            <th className={thClass}>내용</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item.id}>
              <td className={`${tdClass} tabular-nums`}>{item.sentAt}</td>
              <td className={tdClass}>
                <StatusPill tone={item.type === "채팅" ? "sky" : "amber"}>{item.type}</StatusPill>
              </td>
              <td className={tdClass}>{item.userName}</td>
              <td className={`${tdClass} font-medium text-slate-900`}>{item.title}</td>
              <td className={tdClass}>{item.body}</td>
            </tr>
          ))}
          {sorted.length === 0 ? (
            <tr>
              <td className={`${tdClass} text-slate-400`} colSpan={5}>
                발송 내역이 없어요.
              </td>
            </tr>
          ) : null}
        </tbody>
      </DataTable>
      <AdminPager page={page.page} pageCount={page.pageCount} total={page.total} pageSize={page.pageSize} onPage={page.setPage} />
    </>
  );
}
