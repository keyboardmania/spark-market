"use client";

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
  return (
    <ul className="flex flex-col">
      {alarms.map((alarm) => (
        <li key={alarm.id} className={alarm.id === selectedId ? "bg-slate-50" : undefined}>
          <button type="button" onClick={() => onSelect(alarm.id)} className="flex w-full flex-col gap-1 px-5 py-3 text-left">
            <span className="text-xs text-slate-400">{alarm.type}</span>
            <span className="text-sm font-medium text-slate-900">{alarm.title}</span>
            <span className="line-clamp-2 text-sm text-slate-500">{alarm.body}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
