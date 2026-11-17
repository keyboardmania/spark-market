"use client";

import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import type { AlarmRecord } from "@/features/admin-alarms/model";

export function AlarmList({
  alarms,
  selectedId,
  onSelect,
}: {
  alarms: AlarmRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const page = useAdminPage(alarms.length, alarms.map((alarm) => alarm.id).join(","));
  const rows = alarms.slice(page.start, page.start + page.pageSize);
  return (
    <>
    <ul className="flex flex-col">
      {rows.map((alarm) => (
        <li key={alarm.id} className={alarm.id === selectedId ? "bg-slate-50" : undefined}>
          <button type="button" onClick={() => onSelect(alarm.id)} className="flex w-full flex-col gap-1 px-5 py-3 text-left">
            <span className="text-xs text-slate-400">{alarm.type}</span>
            <span className="text-sm font-medium text-slate-900">{alarm.title}</span>
            <span className="line-clamp-2 text-sm text-slate-500">{alarm.body}</span>
          </button>
        </li>
      ))}
    </ul>
    <AdminPager page={page.page} pageCount={page.pageCount} total={page.total} pageSize={page.pageSize} onPage={page.setPage} />
    </>
  );
}
