"use client";

import Link from "next/link";
import { NOTIFICATION_CHANNELS } from "@/data/mockData";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function AlertsPanel() {
  const mounted = useMounted();
  const { user, notifications, removeNotification, clearNotifications, notificationSettings, setNotificationEnabled } = useSpark();
  const sessionUser = mounted ? user : null;
  const items = mounted ? notifications : [];

  if (!sessionUser) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        로그인하면 이 설정을 바꿀 수 있어요.{" "}
        <Link href="/login" className="font-medium text-slate-900">로그인</Link>
      </p>
    );
  }

  return (
    <section id="alerts" className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">알림 수신 설정</h2>
        <p className="mt-1 text-xs text-slate-400">끈 종류는 새로 도착하지 않습니다. 이미 쌓인 알림은 그대로 남습니다.</p>
        <ul className="mt-3 space-y-2">
          {NOTIFICATION_CHANNELS.map((channel) => {
            const setting = notificationSettings.find((item) => item.alarmId === channel.alarmId);
            const enabled = setting?.enabled ?? true;
            return (
              <li key={channel.alarmId}>
                <label className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-medium text-slate-800">{channel.label}</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-7 text-right text-[11px] font-semibold tracking-wide text-slate-400">{enabled ? "ON" : "OFF"}</span>
                    <span className="relative inline-flex h-6 w-11 shrink-0">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={enabled}
                        onChange={(event) => setNotificationEnabled(channel.alarmId, event.target.checked)}
                        className="peer absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none rounded-full bg-slate-200 checked:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                      />
                      <span aria-hidden className="pointer-events-none absolute left-0.5 top-0.5 z-20 h-5 w-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5" />
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">알림함</h2>
          <button
            type="button"
            onClick={clearNotifications}
            disabled={items.length === 0}
            className="text-xs font-medium text-rose-500 disabled:text-slate-300"
          >
            전체 삭제
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">알림은 최신 50개만 남고 그보다 오래된 항목은 삭제됩니다.</p>
        <ul className="mt-3 space-y-2">
          {items.length === 0 ? <li className="text-sm text-slate-400">알림이 없어요.</li> : null}
          {items.map((item) => (
            <li key={item.id} className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${item.isRead ? "border-slate-200" : "border-rose-200 bg-rose-50/40"}`}>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-400">{item.kind} · {item.createdAt}{item.isRead ? "" : " · 안 읽음"}</span>
                <p className="text-slate-800">{item.text}</p>
              </div>
              <button
                type="button"
                aria-label="알림 삭제"
                onClick={() => removeNotification(item.id)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <DismissIcon />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DismissIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
