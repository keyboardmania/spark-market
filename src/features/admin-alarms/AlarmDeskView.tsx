"use client";

import { useState } from "react";
import { AlarmForm } from "@/features/admin-alarms/AlarmForm";
import { AlarmHistoryList } from "@/features/admin-alarms/AlarmHistoryList";
import { AlarmList } from "@/features/admin-alarms/AlarmList";
import { useAlarmDesk } from "@/features/admin-alarms/useAlarmDesk";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { Panel } from "@/components/spark/admin/ui";

const TABS = [
  { id: "alarms", label: "알림 목록" },
  { id: "history", label: "발송 목록" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AlarmDeskView() {
  const desk = useAlarmDesk();
  const [tab, setTab] = useState<TabId>("alarms");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">ALARMS</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">알림 관리</h1>
      </header>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2.5 text-sm ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "alarms" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel title="알림 목록" description="행을 누르면 종류, 제목, 내용을 폼에 불러옵니다." flush>
            <AlarmList alarms={desk.alarms} selectedId={desk.selectedId} onSelect={desk.select} />
          </Panel>
          <Panel title="알림 폼" description="등록, 수정, 삭제는 서로 다른 버튼입니다.">
            <AlarmForm
              draft={desk.draft}
              selected={Boolean(desk.selectedId)}
              notice={desk.notice}
              onChange={desk.setDraft}
              onCreate={desk.create}
              onUpdate={desk.update}
              onDelete={() => {
                if (!desk.selectedId) return;
                setConfirmDelete(true);
              }}
            />
          </Panel>
        </div>
      ) : (
        <Panel title="발송 목록" description="수신자에게 나간 알림 스냅샷입니다. 최신순으로 정렬됩니다." flush>
          <AlarmHistoryList history={desk.history} />
        </Panel>
      )}

      {confirmDelete ? (
        <ConfirmDialog
          title="알림 삭제"
          body="알림을 삭제하시겠습니까?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={() => {
            desk.remove();
            setConfirmDelete(false);
          }}
          onClose={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
}
