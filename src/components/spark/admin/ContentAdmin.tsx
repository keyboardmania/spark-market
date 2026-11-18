"use client";

import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { FAQ_CATEGORIES } from "@/data/mockData";
import { addFaq, addNotice, addTerm, softDeleteFaq, softDeleteNotice, useShared } from "@/data/shared";

export function InquiriesAdmin() {
  const { inquiries, replyInquiry, markInquiryRead } = useAdmin();
  const [selectedId, setSelectedId] = useState(inquiries.find((item) => item.status === "미답변")?.id ?? inquiries[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const selected = inquiries.find((item) => item.id === selectedId) ?? null;
  const inquiryPage = useAdminPage(inquiries.length, "inquiries");
  const inquiryRows = inquiries.slice(inquiryPage.start, inquiryPage.start + inquiryPage.pageSize);

  function openInquiry(id: string, replyText: string) {
    markInquiryRead(id);
    setSelectedId(id);
    setReply(replyText);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">INQUIRIES</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">문의 관리</h1>
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
              {inquiryRows.map((item) => {
                const unread = item.status === "미답변" && !item.isRead;
                return (
                  <tr
                    key={item.id}
                    className={`cursor-pointer ${item.id === selectedId ? "bg-slate-50" : unread ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50"}`}
                    onClick={() => openInquiry(item.id, item.reply)}
                  >
                    <td className={tdClass}>
                      <span className="block font-medium text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          {item.subject}
                          {unread ? <span className="rounded-full bg-rose-500 px-1.5 text-[10px] font-medium leading-4 text-white">1</span> : null}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">{item.createdAt}</span>
                    </td>
                    <td className={tdClass}>
                      {item.member}
                      <span className="block text-xs text-slate-400">{item.email}</span>
                    </td>
                    <td className={tdClass}>
                      <StatusPill tone={item.status === "미답변" ? "rose" : "emerald"}>{item.status}</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
          <AdminPager page={inquiryPage.page} pageCount={inquiryPage.pageCount} total={inquiryPage.total} pageSize={inquiryPage.pageSize} onPage={inquiryPage.setPage} />
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
    </div>
  );
}

export function NoticesAdmin() {
  const shared = useShared();
  const [notice, setNotice] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"일반" | "정책변경" | "사기예방">("일반");
  const liveNotices = shared.notices.filter((item) => !item.deletedAt);
  const noticePage = useAdminPage(liveNotices.length, "notices");
  const noticeRows = liveNotices.slice(noticePage.start, noticePage.start + noticePage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">NOTICES</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">공지사항 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="공지 등록" description="삭제는 숨김 처리입니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim() || !body.trim()) return;
          addNotice({ id: crypto.randomUUID(), category, title: title.trim(), body: body.trim(), createdAt: new Date().toISOString().slice(0, 10), deletedAt: null });
          setTitle("");
          setBody("");
          setNotice("공지를 추가했어요.");
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
      </Panel>
      <Panel title="공지 목록" flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>카테고리</th>
              <th className={thClass}>제목</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {noticeRows.map((item) => (
              <tr key={item.id}>
                <td className={tdClass}>{item.category}</td>
                <td className={`${tdClass} font-medium text-slate-900`}>{item.title}</td>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={tdClass}>
                  <button type="button" className={ghostButtonClass} onClick={() => softDeleteNotice(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
            {liveNotices.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={4}>등록된 공지가 없어요.</td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={noticePage.page} pageCount={noticePage.pageCount} total={noticePage.total} pageSize={noticePage.pageSize} onPage={noticePage.setPage} />
      </Panel>
    </div>
  );
}

export function FaqsAdmin() {
  const shared = useShared();
  const [notice, setNotice] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState<(typeof FAQ_CATEGORIES)[number]>("회원");
  const liveFaqs = shared.faqs.filter((item) => !item.deletedAt);
  const faqPage = useAdminPage(liveFaqs.length, "faqs");
  const faqRows = liveFaqs.slice(faqPage.start, faqPage.start + faqPage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">FAQ</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">FAQ 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="FAQ 등록" description="최신순으로 보이고, 삭제는 숨김 처리입니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!question.trim() || !answer.trim()) return;
          addFaq({ id: crypto.randomUUID(), category: faqCategory, question: question.trim(), answer: answer.trim(), createdAt: new Date().toISOString().slice(0, 10), deletedAt: null });
          setQuestion("");
          setAnswer("");
          setNotice("FAQ를 추가했어요.");
        }}>
          <select value={faqCategory} onChange={(event) => setFaqCategory(event.target.value as (typeof FAQ_CATEGORIES)[number])} className={fieldClass}>
            {FAQ_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="질문" className={fieldClass} />
          <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="답변" className={fieldClass} />
          <button type="submit" className={primaryButtonClass}>FAQ 추가</button>
        </form>
      </Panel>
      <Panel title="FAQ 목록" flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>카테고리</th>
              <th className={thClass}>질문</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {faqRows.map((item) => (
              <tr key={item.id}>
                <td className={tdClass}>{item.category}</td>
                <td className={`${tdClass} font-medium text-slate-900`}>{item.question}</td>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={tdClass}>
                  <button type="button" className={ghostButtonClass} onClick={() => softDeleteFaq(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
            {liveFaqs.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={4}>등록된 FAQ가 없어요.</td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={faqPage.page} pageCount={faqPage.pageCount} total={faqPage.total} pageSize={faqPage.pageSize} onPage={faqPage.setPage} />
      </Panel>
    </div>
  );
}

export function TermsAdmin() {
  const shared = useShared();
  const [notice, setNotice] = useState("");
  const [termTitle, setTermTitle] = useState("");
  const [termBody, setTermBody] = useState("");
  const termPage = useAdminPage(shared.terms.length, "terms");
  const termRows = shared.terms.slice(termPage.start, termPage.start + termPage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">TERMS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">약관 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="약관 등록" description="약관은 추가만 할 수 있습니다.">
        <form className="space-y-2" onSubmit={(event) => {
          event.preventDefault();
          if (!termTitle.trim() || !termBody.trim()) return;
          addTerm({ id: crypto.randomUUID(), title: termTitle.trim(), body: termBody.trim(), createdAt: new Date().toISOString().slice(0, 10) });
          setTermTitle("");
          setTermBody("");
          setNotice("약관 버전을 추가했어요.");
        }}>
          <input value={termTitle} onChange={(event) => setTermTitle(event.target.value)} placeholder="제목" className={fieldClass} />
          <textarea value={termBody} onChange={(event) => setTermBody(event.target.value)} placeholder="본문" className={fieldClass} />
          <button type="submit" className={primaryButtonClass}>약관 추가</button>
        </form>
      </Panel>
      <Panel title="약관 목록" flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>작성일</th>
              <th className={thClass}>제목</th>
            </tr>
          </thead>
          <tbody>
            {termRows.map((item) => (
              <tr key={item.id}>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={`${tdClass} font-medium text-slate-900`}>{item.title}</td>
              </tr>
            ))}
            {shared.terms.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={2}>등록된 약관이 없어요.</td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={termPage.page} pageCount={termPage.pageCount} total={termPage.total} pageSize={termPage.pageSize} onPage={termPage.setPage} />
      </Panel>
    </div>
  );
}

/** @deprecated Use split admins instead */
export function ContentAdmin() {
  return <InquiriesAdmin />;
}
