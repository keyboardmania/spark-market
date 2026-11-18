"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { FAQ_CATEGORIES } from "@/data/mockData";
import { addFaq, addNotice, softDeleteFaq, softDeleteNotice, useShared } from "@/data/shared";

const INQUIRY_FILTERS = ["전체", "미답변", "답변완료"] as const;
type InquiryFilter = (typeof INQUIRY_FILTERS)[number];

export function InquiriesAdmin() {
  const { inquiries, replyInquiry, markInquiryRead } = useAdmin();
  const [selectedId, setSelectedId] = useState(inquiries.find((item) => item.status === "미답변")?.id ?? inquiries[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryFilter>("전체");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter !== "전체" && item.status !== statusFilter) return false;
      if (!needle) return true;
      return `${item.email} ${item.member} ${item.subject}`.toLowerCase().includes(needle);
    });
  }, [inquiries, query, statusFilter]);

  const selected = inquiries.find((item) => item.id === selectedId) ?? null;
  const inquiryPage = useAdminPage(filtered.length, `${statusFilter}:${query}`);
  const inquiryRows = filtered.slice(inquiryPage.start, inquiryPage.start + inquiryPage.pageSize);

  function openInquiry(id: string) {
    markInquiryRead(id);
    setSelectedId(id);
    setReply("");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">INQUIRIES</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">문의 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이메일, 닉네임, 문의 제목"
          className={`${fieldClass} max-w-sm`}
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as InquiryFilter)}
          className={`${fieldClass} max-w-[160px]`}
        >
          {INQUIRY_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item === "전체" ? "전체 상태" : item}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
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
                    onClick={() => openInquiry(item.id)}
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
              {filtered.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-400`} colSpan={3}>
                    검색 결과가 없어요.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </DataTable>
          <AdminPager page={inquiryPage.page} pageCount={inquiryPage.pageCount} total={inquiryPage.total} pageSize={inquiryPage.pageSize} onPage={inquiryPage.setPage} />
        </Panel>
        <Panel title="답변 작성" description={selected ? `${selected.member} · ${selected.email}` : "문의를 선택해 주세요."}>
          {selected ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!reply.trim()) return;
                replyInquiry(selected.id, reply);
                setReply("");
                setNotice(`${selected.member} 님 문의에 답변을 등록했어요.`);
              }}
            >
              <p className="text-sm font-medium text-slate-900">{selected.subject}</p>
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-slate-200/80 px-3.5 py-2.5 text-sm leading-6 text-slate-700">
                  <p className="mb-1 text-[11px] font-medium text-slate-500">{selected.member}</p>
                  {selected.body}
                </div>
                {selected.reply ? (
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-md bg-slate-900 px-3.5 py-2.5 text-sm leading-6 text-white">
                    <p className="mb-1 text-[11px] font-medium text-white/70">관리자</p>
                    {selected.reply}
                  </div>
                ) : null}
              </div>
              <label className="block text-xs font-medium text-slate-500" htmlFor="inquiry-reply">
                답변 입력
              </label>
              <textarea
                id="inquiry-reply"
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={4}
                className={fieldClass}
                placeholder="회원에게 보낼 답변"
              />
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
  const sorted = useMemo(
    () => shared.terms.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [shared.terms],
  );
  const termPage = useAdminPage(sorted.length, "terms");
  const termRows = sorted.slice(termPage.start, termPage.start + termPage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">TERMS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">약관 관리</h1>
        <p className="mt-2 text-sm text-slate-500">약관은 개발자가 코드로 배포한 정적 HTML만 사용합니다. 운영자는 공개 링크와 목록·상세만 확인합니다.</p>
      </div>
      <Panel title="약관 목록" description="등록·수정은 코드 배포로만 반영됩니다." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>제목</th>
              <th className={thClass}>버전</th>
              <th className={thClass}>작성자</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>정적 HTML</th>
              <th className={thClass}>상세</th>
            </tr>
          </thead>
          <tbody>
            {termRows.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className={`${tdClass} font-medium text-slate-900`}>
                  <Link href={`/admin/terms/${item.id}`} className="hover:underline">
                    {item.title}
                  </Link>
                </td>
                <td className={tdClass}>{item.version}</td>
                <td className={tdClass}>{item.author}</td>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={tdClass}>
                  <Link href={`/legal/html/${item.slug}`} className="text-xs text-slate-600 underline underline-offset-2" target="_blank" rel="noreferrer">
                    /legal/html/{item.slug}
                  </Link>
                </td>
                <td className={tdClass}>
                  <Link href={`/admin/terms/${item.id}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600">
                    조회
                  </Link>
                </td>
              </tr>
            ))}
            {sorted.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={6}>
                  등록된 약관이 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={termPage.page} pageCount={termPage.pageCount} total={termPage.total} pageSize={termPage.pageSize} onPage={termPage.setPage} />
      </Panel>
    </div>
  );
}

export function TermsDetailAdmin({ termId }: { termId: string }) {
  const shared = useShared();
  const term = shared.terms.find((item) => item.id === termId) ?? null;

  if (!term) {
    return (
      <div className="space-y-4">
        <Link href="/admin/terms" className="text-sm text-slate-500 hover:text-slate-900">
          ← 약관 목록
        </Link>
        <p className="text-sm text-slate-500">약관을 찾을 수 없어요.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/terms" className="text-sm text-slate-500 hover:text-slate-900">
          ← 약관 목록
        </Link>
        <p className="mt-3 text-[11px] font-medium tracking-[0.22em] text-slate-400">TERM DETAIL</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{term.title}</h1>
        <p className="mt-2 text-sm text-slate-500">개발자가 배포한 정적 HTML을 조회합니다. 어드민에서 등록·수정할 수 없습니다.</p>
      </div>
      <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-slate-400">버전</dt>
          <dd className="mt-1 text-sm text-slate-900">{term.version}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">작성자</dt>
          <dd className="mt-1 text-sm text-slate-900">{term.author}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">작성일</dt>
          <dd className="mt-1 text-sm tabular-nums text-slate-900">{term.createdAt}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-slate-400">정적 HTML 링크</dt>
          <dd className="mt-1 text-sm text-slate-900">
            <Link href={`/legal/html/${term.slug}`} className="underline underline-offset-2" target="_blank" rel="noreferrer">
              /legal/html/{term.slug}
            </Link>
          </dd>
        </div>
      </dl>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">HTML 미리보기</h2>
        <article
          className="prose prose-slate mt-4 max-w-none text-sm leading-7 text-slate-700 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:my-1 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: term.body }}
        />
      </section>
      <div>
        <Link href="/admin/terms" className={ghostButtonClass}>
          목록으로
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use split admins instead */
export function ContentAdmin() {
  return <InquiriesAdmin />;
}
