import type { AlarmHistoryRecord } from "@/features/admin-alarms/model";

export function AlarmHistoryList({ history }: { history: AlarmHistoryRecord[] }) {
  return (
    <ul className="flex flex-col">
      {history.map((item) => (
        <li key={item.id} className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3 text-sm">
          <span className="text-xs text-slate-400">{item.sentAt} · {item.userName}</span>
          <span className="font-medium text-slate-900">{item.title}</span>
          <span className="text-slate-600">{item.body}</span>
        </li>
      ))}
    </ul>
  );
}
