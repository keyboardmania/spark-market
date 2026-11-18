"use client";

import { useMemo, useState } from "react";
import {
  SETTLEMENT_VIEW_FILTERS,
  formatPrice,
  type AdminSettlement,
  type SettlementStatus,
  type SettlementViewFilter,
} from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function SettlementsAdmin() {
  const { settlements, approveSettlement, approveSettlementCancel } = useAdmin();
  const [notice, setNotice] = useState("");
  const [settleEmail, setSettleEmail] = useState("");
  const [view, setView] = useState<SettlementViewFilter>("전체 정산 기록");
  const [confirm, setConfirm] = useState<{ kind: "approve" | "cancel"; item: AdminSettlement } | null>(null);
  const settleNeedle = settleEmail.trim().toLowerCase();

  const counts = useMemo(() => {
    const next = {
      "정산 승인 대기": 0,
      "정산 취소 대기": 0,
      "정산 완료": 0,
      "정산 취소 완료": 0,
      "전체 정산 기록": settlements.length,
    };
    for (const item of settlements) next[item.status] += 1;
    return next;
  }, [settlements]);

  const shownSettlements = settlements
    .filter((item) => {
      if (settleNeedle && !item.email.toLowerCase().includes(settleNeedle)) return false;
      if (view === "전체 정산 기록") return true;
      return item.status === view;
    })
    .slice()
    .sort((a, b) => {
      const aKey = a.completedAt ?? a.requestedAt;
      const bKey = b.completedAt ?? b.requestedAt;
      return bKey.localeCompare(aKey) || b.requestedAt.localeCompare(a.requestedAt);
    });

  const settlePage = useAdminPage(shownSettlements.length, `${settleEmail}:${view}`);
  const settleRows = shownSettlements.slice(settlePage.start, settlePage.start + settlePage.pageSize);
  const showActions = view === "전체 정산 기록" || view === "정산 승인 대기" || view === "정산 취소 대기";

  function runConfirm() {
    if (!confirm) return;
    const { kind, item } = confirm;
    setConfirm(null);
    if (kind === "approve") {
      approveSettlement(item.id);
      setNotice(`${item.seller} 님의 정산 ${formatPrice(item.amount)}을 승인했어요. ${item.holderEn} · ${item.account} · ${item.bankEn} · ${item.bankCode}`);
      return;
    }
    const result = approveSettlementCancel(item.id);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    const tradesLabel = result.tradeIds.length > 0 ? result.tradeIds.join(", ") : "연동 거래 없음";
    setNotice(`${item.seller} 님 정산 취소를 승인했어요. 에스크로/PG 환불을 요청했고, 연동 거래를 취소(환불)로 바꿨어요. (${tradesLabel})`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SETTLEMENTS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">정산 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <FilterBar>
        <FilterField label="판매자 이메일">
          <input value={settleEmail} onChange={(event) => setSettleEmail(event.target.value)} placeholder="판매자 이메일" className={fieldClass} />
        </FilterField>
        <FilterField label="정산 상태" className="sm:max-w-[220px]">
          <select
            value={view}
            onChange={(event) => {
              const next = event.target.value as SettlementViewFilter;
              if (SETTLEMENT_VIEW_FILTERS.includes(next)) setView(next);
            }}
            className={fieldClass}
          >
            {SETTLEMENT_VIEW_FILTERS.map((item) => (
              <option key={item} value={item}>
                {item} ({counts[item]})
              </option>
            ))}
          </select>
        </FilterField>
      </FilterBar>
      <Panel title={view} description={panelDescription(view)} flush>
        <DataTable className="min-w-[1180px]">
          <thead>
            <tr>
              <th className={thClass}>판매자</th>
              <th className={thClass}>영문 예금주</th>
              <th className={thClass}>계좌</th>
              <th className={thClass}>은행</th>
              <th className={thClass}>은행코드</th>
              <th className={thClass}>정산액</th>
              <th className={thClass}>연동 거래</th>
              <th className={thClass}>요청일</th>
              <th className={thClass}>완료일시</th>
              <th className={thClass}>상태</th>
              {showActions ? <th className={thClass}>처리</th> : null}
            </tr>
          </thead>
          <tbody>
            {settleRows.map((item) => (
              <tr key={item.id}>
                <td className={tdClass}>
                  <span className="block font-medium text-slate-900">{item.seller}</span>
                  <span className="text-xs text-slate-400">
                    {item.email} · 거래 {item.trades}건
                  </span>
                </td>
                <td className={tdClass}>{item.holderEn}</td>
                <td className={`${tdClass} tabular-nums`}>{item.account}</td>
                <td className={tdClass}>{item.bankEn}</td>
                <td className={tdClass}>{item.bankCode}</td>
                <td className={`${tdClass} tabular-nums`}>{formatPrice(item.amount)}</td>
                <td className={`${tdClass} text-xs tabular-nums`}>{item.tradeIds.length > 0 ? item.tradeIds.join(", ") : "—"}</td>
                <td className={`${tdClass} tabular-nums`}>{item.requestedAt}</td>
                <td className={`${tdClass} tabular-nums`}>{item.completedAt ?? "—"}</td>
                <td className={tdClass}>
                  <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill>
                </td>
                {showActions ? (
                  <td className={tdClass}>
                    {item.status === "정산 승인 대기" ? (
                      <button
                        type="button"
                        onClick={() => setConfirm({ kind: "approve", item })}
                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        정산 승인
                      </button>
                    ) : item.status === "정산 취소 대기" ? (
                      <button
                        type="button"
                        onClick={() => setConfirm({ kind: "cancel", item })}
                        className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        정산 취소 승인
                      </button>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
            {shownSettlements.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={showActions ? 11 : 10}>
                  표시할 {view}이(가) 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={settlePage.page} pageCount={settlePage.pageCount} total={settlePage.total} pageSize={settlePage.pageSize} onPage={settlePage.setPage} />
      </Panel>
      {confirm ? (
        <ConfirmDialog
          title={confirm.kind === "approve" ? "정산 승인" : "정산 취소 승인"}
          body={confirm.kind === "approve" ? "정산을 승인할까요?" : "정산 취소를 승인할까요?"}
          confirmLabel="승인"
          cancelLabel="닫기"
          onConfirm={runConfirm}
          onClose={() => setConfirm(null)}
        />
      ) : null}
    </div>
  );
}

function panelDescription(view: SettlementViewFilter) {
  if (view === "정산 승인 대기") return "판매자 정산 요청을 승인합니다.";
  if (view === "정산 취소 대기") return "정산 취소 요청 승인 시 에스크로/PG 환불과 거래 취소(환불)가 함께 반영됩니다.";
  if (view === "정산 완료") return "정산이 승인·이체 완료된 기록입니다.";
  if (view === "정산 취소 완료") return "정산 취소와 환불이 반영된 기록입니다.";
  return "승인·취소 대기와 완료된 모든 정산 이력을 조회합니다.";
}

function statusTone(status: SettlementStatus) {
  if (status === "정산 완료") return "emerald" as const;
  if (status === "정산 취소 완료") return "slate" as const;
  if (status === "정산 취소 대기") return "rose" as const;
  return "amber" as const;
}
