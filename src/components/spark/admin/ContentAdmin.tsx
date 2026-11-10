"use client";

import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { addFaq, addNotice, addTerm, softDeleteFaq, softDeleteNotice, useShared } from "@/data/shared";

export function ContentAdmin() {
  const { inquiries, replyInquiry } = useAdmin();
  const shared = useShared();
  const [selectedId, setSelectedId] = useState(inquiries.find((item) => item.status === "미답변")?.id ?? inquiries[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const selected = inquiries.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">DESK</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">문의·공지·FAQ·약관 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="1:1 문의" flush>
          <DataTable>
            <thead>
              <tr>
                <th className={thClass}>문의</th>
                <th className={thClass}>회원</th>
                <th className={thClass}>상태</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((item) => (
                <tr key={item.id} className={item.id === selectedId ? "bg-slate-50" : undefined}>
                  <td className={tdClass}>
                    <button type="button" className="text-left" onClick={() => { setSelectedId(item.id); setReply(item.reply); }}>
                      <span className="block font-medium text-slate-900">{item.subject}</span>
                      <span className="text-xs text-slate-400">{item.createdAt}</span>
                    </button>
                  </td>
                  <td className={tdClass}>
                    {item.member}
                    <span className="block text-xs text-slate-400">{item.email}</span>
                  </td>
                  <td className={tdClass}>
                    <StatusPill tone={item.status === "미답변" ? "rose" : "emerald"}>{item.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
        <Panel title="답변 작성" description={selected ? selected.member : "문의를 선택해 주세요."}>
          {selected ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!reply.trim()) return;
                replyInquiry(selected.id, reply);
                setNotice(`${selected.member} 님 문의에 답변을 등록했어요.`);
              }}
            >
              <p className="text-sm font-medium text-slate-900">{selected.subject}</p>
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{selected.body}</p>
              {selected.reply ? <p className="text-xs text-slate-400">이전 답변 · {selected.reply}</p> : null}
              <label className="block text-xs font-medium text-slate-500" htmlFor="inquiry-reply">
                답변
              </label>
              <textarea id="inquiry-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={5} className={fieldClass} placeholder="회원에게 보낼 답변" />
              <button type="submit" className={primaryButtonClass} disabled={!reply.trim()}>
                답변 등록
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-400">선택된 문의가 없어요.</p>
          )}
        </Panel>
      </div>
      <ContentDesk notice={setNotice} faqs={shared.faqs} notices={shared.notices} terms={shared.terms} />
    </div>
  );
}

function ContentDesk({
  notice,
  faqs,
  notices,
  terms,
}: {
  notice: (message: string) => void;
  faqs: ReturnType<typeof useShared>["faqs"];
  notices: ReturnType<typeof useShared>["notices"];
  terms: ReturnType<typeof useShared>["terms"];
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"일반" | "정책변경" | "사기예방">("일반");
  const [termTitle, setTermTitle] = useState("");
  const [termBody, setTermBody] = useState("");
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="FAQ" description="최신순으로 보이고, 삭제는 숨김 처리입니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!question.trim() || !answer.trim()) return;
          addFaq({ id: crypto.randomUUID(), question: question.trim(), answer: answer.trim(), createdAt: new Date().toISOString().slice(0, 10), deletedAt: null });
          setQuestion("");
          setAnswer("");
          notice("FAQ를 추가했어요.");
        }}>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="질문" className={fieldClass} />
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="답변" className={fieldClass} />
          <button type="submit" className={primaryButtonClass}>FAQ 추가</button>
        </form>
        <ul className="mt-4 space-y-2">
          {faqs.filter((item) => !item.deletedAt).map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span>{item.question}</span>
              <button type="button" className={ghostButtonClass} onClick={() => softDeleteFaq(item.id)}>삭제</button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="공지" description="삭제는 숨김 처리입니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !body.trim()) return;
          addNotice({ id: crypto.randomUUID(), category, title: title.trim(), body: body.trim(), createdAt: new Date().toISOString().slice(0, 10), deletedAt: null });
          setTitle("");
          setBody("");
          notice("공지를 추가했어요.");
        }}>
          <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className={fieldClass}>
            <option value="일반">일반</option>
            <option value="정책변경">정책변경</option>
            <option value="사기예방">사기예방</option>
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목" className={fieldClass} />
          <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="내용" className={fieldClass} />
          <button type="submit" className={primaryButtonClass}>공지 추가</button>
        </form>
        <ul className="mt-4 space-y-2">
          {notices.filter((item) => !item.deletedAt).map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
              <span>{item.category} · {item.title}</span>
              <button type="button" className={ghostButtonClass} onClick={() => softDeleteNotice(item.id)}>삭제</button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="약관" description="약관은 추가만 할 수 있습니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!termTitle.trim() || !termBody.trim()) return;
          addTerm({ id: crypto.randomUUID(), title: termTitle.trim(), body: termBody.trim(), createdAt: new Date().toISOString().slice(0, 10) });
          setTermTitle("");
          setTermBody("");
          notice("약관 버전을 추가했어요.");
        }}>
          <input value={termTitle} onChange={(event) => setTermTitle(event.target.value)} placeholder="제목" className={fieldClass} />
          <textarea value={termBody} onChange={(event) => setTermBody(event.target.value)} placeholder="본문" className={fieldClass} />
          <button type="submit" className={primaryButtonClass}>약관 추가</button>
        </form>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {terms.map((item) => <li key={item.id}>{item.createdAt} · {item.title}</li>)}
        </ul>
      </Panel>
    </div>
  );
}
