"use client";

import { useMemo, useState } from "react";
import {
  INQUIRY_TYPES,
  SANCTIONS,
  USER_INQUIRIES,
  type InquiryType,
  type NoticeCategory,
  type UserInquiry,
  type UserInquiryStatus,
} from "@/data/mockData";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { useShared } from "@/data/shared";

const FILTERS = ["전체", "답변완료", "확인중", "접수 완료"] as const;

export function SupportView() {
  const shared = useShared();
  const faqs = shared.faqs.filter((item) => !item.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const notices = shared.notices.filter((item) => !item.deletedAt);
  const [noticeFilter, setNoticeFilter] = useState<NoticeCategory | "전체">("전체");
  const [inquiries, setInquiries] = useState<UserInquiry[]>(USER_INQUIRIES);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("전체");
  const [type, setType] = useState<InquiryType | "">("");
  const [body, setBody] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [done, setDone] = useState(false);

  const visibleNotices = notices.filter((item) => noticeFilter === "전체" || item.category === noticeFilter);
  const visibleInquiries = useMemo(
    () => inquiries.filter((item) => filter === "전체" || item.status === (filter as UserInquiryStatus)),
    [filter, inquiries],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SUPPORT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">고객센터</h1>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">자주 묻는 질문</h2>
        <ul className="mt-4 space-y-3">
          {faqs.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm font-medium text-slate-900">{item.question}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">문의하기</h2>
        <form
          className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!type || body.trim().length < 1) return;
            setInquiries((current) => [
              {
                id: `inq-${Date.now()}`,
                type,
                body: body.trim(),
                photoName: photoName || undefined,
                status: "접수 완료",
                createdAt: "2026.11.10",
                reply: "",
              },
              ...current,
            ]);
            setType("");
            setBody("");
            setPhotoName("");
            setDone(true);
          }}
        >
          <label className="block space-y-2 text-xs text-slate-500">문의 유형
            <select value={type} onChange={(event) => setType(event.target.value as InquiryType | "")} className={fieldClass}>
              <option value="">선택해 주세요</option>
              {INQUIRY_TYPES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block space-y-2 text-xs text-slate-500">내용
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} className={fieldClass} />
          </label>
          <label className="block space-y-2 text-xs text-slate-500">사진 첨부 (선택)
            <input type="file" accept="image/*" onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? "")} className="block text-sm" />
          </label>
          <button type="submit" className={primaryButtonClass}>접수하기</button>
          {done ? <p className="text-sm text-slate-500">문의가 접수 완료되었습니다.</p> : null}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">문의 내역</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-sm ${filter === item ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>
              {item}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {visibleInquiries.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm">
              <p className="text-xs text-slate-400">{item.status} · {item.type} · {item.createdAt}</p>
              <p className="mt-2 text-slate-800">{item.body}</p>
              {item.reply ? <p className="mt-2 text-slate-500">답변 {item.reply}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">공지사항</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["전체", "일반", "정책변경", "사기예방"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setNoticeFilter(item)} className={`rounded-full px-3 py-1.5 text-sm ${noticeFilter === item ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>
              {item}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {visibleNotices.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-xs text-slate-400">{item.category} · {item.createdAt}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">내상점 제재내역</h2>
        <ul className="mt-4 space-y-3">
          {SANCTIONS.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>제한일시 {item.limitedAt}</p>
              <p>해제일시 {item.releasedAt}</p>
              <p>제한기간 {item.period}</p>
              <p>제한사유 {item.reason}</p>
              <p>위반유형 {item.violation}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
