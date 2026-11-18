"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  type Notice,
  type NoticeCategory,
  type NoticeImage,
  type NoticePublishMode,
} from "@/data/mockData";
import { joinDisplayDateTime, splitDisplayDateTime } from "@/features/admin-notices/datetime";
import { NoticeImageField } from "@/features/admin-notices/NoticeImageField";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export type NoticeFormValues = {
  category: NoticeCategory;
  title: string;
  body: string;
  publishMode: NoticePublishMode;
  scheduleDate: string;
  scheduleTime: string;
  visible: boolean;
  pinned: boolean;
  endDate: string;
  endTime: string;
  images: NoticeImage[];
};

const EMPTY_FORM: NoticeFormValues = {
  category: "일반",
  title: "",
  body: "",
  publishMode: "즉시",
  scheduleDate: "",
  scheduleTime: "",
  visible: true,
  pinned: false,
  endDate: "",
  endTime: "",
  images: [],
};

export function noticeToFormValues(notice: Notice): NoticeFormValues {
  const schedule = splitDisplayDateTime(notice.scheduledAt);
  const end = splitDisplayDateTime(notice.endsAt);
  return {
    category: notice.category,
    title: notice.title,
    body: notice.body,
    publishMode: notice.publishMode,
    scheduleDate: schedule.date,
    scheduleTime: schedule.time,
    visible: notice.visible,
    pinned: notice.pinned,
    endDate: end.date,
    endTime: end.time,
    images: notice.images.map((image) => ({ ...image })),
  };
}

export function formValuesToNoticePatch(values: NoticeFormValues) {
  const scheduledAt =
    values.publishMode === "예약" ? joinDisplayDateTime(values.scheduleDate, values.scheduleTime || "00:00") : null;
  return {
    category: values.category,
    title: values.title.trim(),
    body: values.body.trim(),
    publishMode: values.publishMode,
    scheduledAt,
    visible: values.visible,
    pinned: values.pinned,
    endsAt: joinDisplayDateTime(values.endDate, values.endTime || (values.endDate ? "23:59" : "")),
    images: values.images,
  };
}

export function NoticeFormModal({
  mode,
  initial,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Notice | null;
  onClose: () => void;
  onSubmit: (values: NoticeFormValues) => void;
}) {
  const [form, setForm] = useState<NoticeFormValues>(initial ? noticeToFormValues(initial) : EMPTY_FORM);
  const [error, setError] = useState("");
  const scheduleEnabled = form.publishMode === "예약";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function patch<K extends keyof NoticeFormValues>(key: K, value: NoticeFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!form.body.trim()) {
      setError("내용을 입력해 주세요.");
      return;
    }
    if (form.publishMode === "예약" && !form.scheduleDate) {
      setError("예약 게시 날짜를 선택해 주세요.");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-form-title"
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="notice-form-title" className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "공지사항 등록" : "공지사항 수정"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-slate-500 hover:bg-slate-50">
            닫기
          </button>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <fieldset>
            <legend className="text-xs font-medium text-slate-500">등록 방법</legend>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(["즉시", "예약"] as const).map((item) => {
                const active = form.publishMode === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => patch("publishMode", item)}
                    className={`rounded-full px-4 py-2 text-sm ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  >
                    {item}
                  </button>
                );
              })}
              <input
                type="date"
                value={form.scheduleDate}
                disabled={!scheduleEnabled}
                onChange={(event) => patch("scheduleDate", event.target.value)}
                className={`${fieldClass} max-w-[160px]`}
              />
              <input
                type="time"
                value={form.scheduleTime}
                disabled={!scheduleEnabled}
                onChange={(event) => patch("scheduleTime", event.target.value)}
                className={`${fieldClass} max-w-[120px]`}
              />
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.visible} onChange={(event) => patch("visible", event.target.checked)} />
              노출 여부
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.pinned} onChange={(event) => patch("pinned", event.target.checked)} />
              상단 고정
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-slate-500">노출 종료 일시</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="date"
                value={form.endDate}
                onChange={(event) => patch("endDate", event.target.value)}
                className={`${fieldClass} max-w-[160px]`}
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => patch("endTime", event.target.value)}
                className={`${fieldClass} max-w-[120px]`}
              />
            </div>
          </fieldset>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>카테고리</span>
            <select
              value={form.category}
              onChange={(event) => patch("category", event.target.value as NoticeCategory)}
              className={fieldClass}
            >
              <option value="일반">일반</option>
              <option value="정책변경">정책변경</option>
              <option value="사기예방">사기예방</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>제목</span>
            <input
              value={form.title}
              onChange={(event) => patch("title", event.target.value)}
              placeholder="공지 제목"
              className={fieldClass}
            />
          </label>

          <label className="flex flex-col gap-2 text-xs text-slate-500">
            <span>내용</span>
            <textarea
              value={form.body}
              onChange={(event) => patch("body", event.target.value)}
              placeholder="공지 내용"
              rows={6}
              className={fieldClass}
            />
          </label>

          <NoticeImageField images={form.images} onChange={(images) => patch("images", images)} />

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex gap-2 pt-1">
            <button type="button" className={`${ghostButtonClass} flex-1`} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={`${primaryButtonClass} flex-1`}>
              {mode === "create" ? "등록" : "수정 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
