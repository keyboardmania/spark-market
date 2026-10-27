"use client";

import { useState } from "react";
import { REPORT_STATUSES, type ReportStatus } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function SupportAdmin() {
  const { inquiries, replyInquiry, reports, setReportStatus } = useAdmin();
  const [selectedId, setSelectedId] = useState(inquiries.find((item) => item.status === "미답변")?.id ?? inquiries[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [notice, setNotice] = useState("");
  const selected = inquiries.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CARE</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">고객센터 & 신고 관리</h1>
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
      <Panel title="신고 내역" description="처리 상태를 바꾸면 대시보드의 미처리 건수에 반영됩니다." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>대상</th>
              <th className={thClass}>사유</th>
              <th className={thClass}>신고자</th>
              <th className={thClass}>상태</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className={tdClass}>
                  <span className="block font-medium text-slate-900">{report.targetLabel}</span>
                  <span className="text-xs text-slate-400">
                    {report.targetType} · {report.createdAt}
                  </span>
                </td>
                <td className={tdClass}>{report.reason}</td>
                <td className={tdClass}>{report.reporter}</td>
                <td className={tdClass}>
                  <label className="sr-only" htmlFor={`report-${report.id}`}>
                    {report.targetLabel} 처리 상태
                  </label>
                  <select
                    id={`report-${report.id}`}
                    value={report.status}
                    onChange={(event) => {
                      const status = event.target.value as ReportStatus;
                      setReportStatus(report.id, status);
                      setNotice(`${report.targetLabel} 신고 상태를 ‘${status}’로 바꿨어요.`);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
                  >
                    {REPORT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}
