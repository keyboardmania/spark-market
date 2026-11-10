"use client";

import { useMemo, useState } from "react";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, DetailModal, DetailRows, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { acceptReport, isReportClosed, rejectReport, reportCategory, reportTimestamp, reviewReport, useShared, type LiveReport } from "@/data/shared";

const FILTERS = ["완료 제외", "전체", "접수", "검토", "수락", "거절"] as const;
type ReportFilter = (typeof FILTERS)[number];

export function SupportAdmin() {
  const { products } = useSpark();
  const shared = useShared();
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ReportFilter>("완료 제외");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = shared.reports
    .filter((report) => {
      const needle = query.trim().toLowerCase();
      const textOk = !needle || `${report.reporter} ${report.targetLabel} ${report.body} ${report.category}`.toLowerCase().includes(needle);
      if (!textOk) return false;
      if (filter === "완료 제외") return !isReportClosed(report.status);
      if (filter === "전체") return true;
      return report.status === filter;
    })
    .slice()
    .sort((a, b) => (sort === "asc" ? reportTimestamp(a.createdAt) - reportTimestamp(b.createdAt) : reportTimestamp(b.createdAt) - reportTimestamp(a.createdAt)));
  const selected = shared.reports.find((report) => report.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">REPORTS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">고객센터 신고 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <FilterBar>
        <FilterField label="신고 검색">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="신고자, 대상, 내용" className={fieldClass} />
        </FilterField>
        <FilterField label="상태" className="sm:max-w-[160px]">
          <select value={filter} onChange={(event) => setFilter(event.target.value as ReportFilter)} className={fieldClass}>
            {FILTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FilterField>
        <button type="button" className="self-end rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" onClick={() => setSort((current) => (current === "asc" ? "desc" : "asc"))}>
          {sort === "asc" ? "오래된 순" : "최신 순"}
        </button>
      </FilterBar>
      <Panel title="신고 목록" description="기본은 오래된 순이고, 수락·거절(완료)은 빼 둡니다. 같은 대상 수락이 3회를 넘으면 상품 삭제, 유저 3일 정지, 리뷰 삭제가 적용됩니다." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>신고 카테고리</th>
              <th className={thClass}>신고자</th>
              <th className={thClass}>신고대상</th>
              <th className={thClass}>신고 일시</th>
              <th className={thClass}>신고 상태</th>
              <th className={thClass}>상세</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((report) => (
              <tr key={report.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(report.id)}>
                <td className={tdClass}>{report.category}</td>
                <td className={tdClass}>{report.reporter}</td>
                <td className={`${tdClass} font-medium text-slate-900`}>{report.targetLabel}</td>
                <td className={`${tdClass} tabular-nums`}>{report.createdAt}</td>
                <td className={tdClass}>
                  <StatusPill tone={reportTone(report.status)}>{report.status}</StatusPill>
                </td>
                <td className={tdClass}>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId(report.id);
                    }}
                  >
                    상세
                  </button>
                </td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={6}>
                  표시할 신고가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
      </Panel>
      {selected ? (
        <ReportDetail
          report={selected}
          reports={shared.reports}
          reserved={products.find((item) => item.id === selected.targetId)?.saleStatus === "예약중"}
          onClose={() => setSelectedId(null)}
          onNotice={setNotice}
        />
      ) : null}
    </div>
  );
}

function ReportDetail({
  report,
  reports,
  reserved,
  onClose,
  onNotice,
}: {
  report: LiveReport;
  reports: LiveReport[];
  reserved: boolean;
  onClose: () => void;
  onNotice: (message: string) => void;
}) {
  const close = useMemo(() => onClose, [onClose]);
  const strikes = reports.filter((item) => item.status === "수락" && item.targetId === report.targetId && reportCategory(item.targetType) === reportCategory(report.targetType)).length;
  const open = report.status === "접수" || report.status === "검토";
  return (
    <DetailModal title="신고 상세" onClose={close} wide>
      <DetailRows
        rows={[
          { label: "신고 카테고리", value: report.category },
          { label: "신고자", value: report.reporter },
          { label: "신고대상", value: report.targetLabel },
          { label: "신고 일시", value: report.createdAt },
          { label: "신고 상태", value: report.status },
          { label: "신고 내용", value: report.body },
          { label: "신고 누적 횟수", value: `수락 ${strikes}회` },
        ]}
      />
      <div className="mt-4">
        <p className="text-xs text-slate-400">신고 미디어</p>
        {report.media.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-3">
            {report.media.map((item) => (
              <li key={item.id}>
                <img src={item.url} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                <p className="mt-1 text-xs text-slate-400">{item.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">{report.photoCount > 0 ? `사진 ${report.photoCount}장` : "첨부된 미디어가 없어요."}</p>
        )}
      </div>
      {open ? (
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {report.status === "접수" ? (
            <button
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs"
              onClick={() => {
                reviewReport(report.id);
                onNotice("신고를 검토 상태로 바꿨어요.");
              }}
            >
              검토
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white"
            onClick={() => onNotice(acceptReport(report.id, { reserved }))}
          >
            수락
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs"
            onClick={() => {
              rejectReport(report.id);
              onNotice("신고를 거절했어요.");
            }}
          >
            거절
          </button>
        </div>
      ) : null}
    </DetailModal>
  );
}

function reportTone(status: LiveReport["status"]) {
  if (status === "수락") return "emerald" as const;
  if (status === "거절") return "slate" as const;
  if (status === "검토") return "amber" as const;
  return "rose" as const;
}
