"use client";

import { useState } from "react";
import {
  EMPTY_ALARM_DRAFT,
  SEED_ALARMS,
  SEED_ALARM_HISTORY,
  type AlarmDraft,
  type AlarmRecord,
} from "@/features/admin-alarms/model";

export function useAlarmDesk() {
  const [alarms, setAlarms] = useState<AlarmRecord[]>(SEED_ALARMS);
  const [history] = useState(SEED_ALARM_HISTORY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AlarmDraft>(EMPTY_ALARM_DRAFT);
  const [notice, setNotice] = useState("");

  function select(id: string) {
    const found = alarms.find((item) => item.id === id);
    if (!found) return;
    setSelectedId(id);
    setDraft({ type: found.type, title: found.title, body: found.body });
    setNotice("");
  }

  function clear() {
    setSelectedId(null);
    setDraft(EMPTY_ALARM_DRAFT);
  }

  function create() {
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) return;
    setAlarms((items) => [{ id: crypto.randomUUID(), type: draft.type, title, body }, ...items]);
    clear();
    setNotice("알림을 등록했어요.");
  }

  function update() {
    if (!selectedId) return;
    const title = draft.title.trim();
    const body = draft.body.trim();
    if (!title || !body) return;
    setAlarms((items) => items.map((item) => (item.id === selectedId ? { ...item, type: draft.type, title, body } : item)));
    setNotice("알림을 수정했어요.");
  }

  function remove() {
    if (!selectedId) return;
    setAlarms((items) => items.filter((item) => item.id !== selectedId));
    clear();
    setNotice("알림을 삭제했어요.");
  }

  return { alarms, history, selectedId, draft, setDraft, notice, select, clear, create, update, remove };
}
