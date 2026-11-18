"use client";

import { useState } from "react";
import { SETTLEMENT_STATUSES, formatPrice } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function SettlementsAdmin() {
  const { settlements, approveSettlement } = useAdmin();
  const [notice, setNotice] = useState("");
  const [settleEmail, setSettleEmail] = useState("");
  const [settleStatus, setSettleStatus] = useState("전체");
  const settleNeedle = settleEmail.trim().toLowerCase();
  const shownSettlements = settlements
    .filter((item) => (!settleNeedle || item.email.toLowerCase().includes(settleNeedle)) && (settleStatus === "전체" || item.status === settleStatus))
    .slice()
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  const waiting = shownSettlements.filter((item) => item.status === "정산대기").length;
  const settlePage = useAdminPage(shownSettlements.length, `${settleEmail}:${settleStatus}`);
  const settleRows = shownSettlements.slice(settlePage.start, settlePage.start + settlePage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SETTLEMENTS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">정산 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="정산 요청" description={`요청일 기준 정렬 · 이 목록의 승인 대기 ${waiting}건`} flush>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-4 py-3">
          <input value={settleEmail} onChange={(event) => setSettleEmail(event.target.value)} placeholder="판매자 이메일" className={`${fieldClass} max-w-xs`} />
          <select value={settleStatus} onChange={(event) => setSettleStatus(event.target.value)} className={`${fieldClass} max-w-[160px]`}>
            <option value="전체">전체 상태</option>
            {SETTLEMENT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <DataTable className="min-w-[1080px]">
          <thead>
            <tr>
              <th className={thClass}>판매자</th>
              <th className={thClass}>영문 예금주</th>
              <th className={thClass}>계좌</th>
              <th className={thClass}>은행</th>
              <th className={thClass}>은행코드</th>
              <th className={thClass}>정산액</th>
              <th className={thClass}>요청일</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>승인</th>
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
                <td className={`${tdClass} tabular-nums`}>{item.requestedAt}</td>
                <td className={tdClass}>
                  <StatusPill tone={item.status === "정산대기" ? "amber" : item.status === "승인완료" ? "emerald" : "slate"}>{item.status}</StatusPill>
                </td>
                <td className={tdClass}>
                  <button
                    type="button"
                    disabled={item.status !== "정산대기"}
                    onClick={() => {
                      approveSettlement(item.id);
                      setNotice(`${item.seller} 님의 정산 ${formatPrice(item.amount)}을 승인했어요. ${item.holderEn} · ${item.account} · ${item.bankEn} · ${item.bankCode}`);
                    }}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    정산 승인
                  </button>
                </td>
              </tr>
            ))}
            {shownSettlements.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={9}>
                  표시할 정산 요청이 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={settlePage.page} pageCount={settlePage.pageCount} total={settlePage.total} pageSize={settlePage.pageSize} onPage={settlePage.setPage} />
      </Panel>
    </div>
  );
}
