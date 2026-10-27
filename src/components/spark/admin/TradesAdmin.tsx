"use client";

import { useState } from "react";
import { formatPrice } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function TradesAdmin() {
  const { trades, setTradeStatus, settlements, approveSettlement } = useAdmin();
  const [notice, setNotice] = useState("");
  const waiting = settlements.filter((item) => item.status === "정산대기").length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SETTLEMENT</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">거래 & 정산 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="거래 내역" description="분쟁으로 전환하거나 거래를 취소할 수 있어요." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>주문</th>
              <th className={thClass}>구매자</th>
              <th className={thClass}>판매자</th>
              <th className={thClass}>금액</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>변경</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className={tdClass}>
                  <span className="block font-medium text-slate-900">{trade.title}</span>
                  <span className="text-xs text-slate-400">
                    {trade.id} · {trade.orderedAt}
                  </span>
                </td>
                <td className={tdClass}>{trade.buyer}</td>
                <td className={tdClass}>{trade.seller}</td>
                <td className={`${tdClass} tabular-nums`}>{formatPrice(trade.amount)}</td>
                <td className={tdClass}>
                  <StatusPill tone={trade.status === "분쟁" ? "rose" : trade.status === "거래취소" ? "slate" : "emerald"}>{trade.status}</StatusPill>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={trade.status === "거래취소"}
                      onClick={() => {
                        setTradeStatus(trade.id, "거래취소");
                        setNotice(`${trade.id} 거래를 취소했어요.`);
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:text-slate-300"
                    >
                      거래 취소
                    </button>
                    <button
                      type="button"
                      disabled={trade.status === "분쟁"}
                      onClick={() => {
                        setTradeStatus(trade.id, "분쟁");
                        setNotice(`${trade.id} 거래를 분쟁으로 전환했어요.`);
                      }}
                      className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 disabled:text-slate-300 disabled:bg-transparent"
                    >
                      분쟁
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
      <Panel title="정산 요청" description={`승인 대기 ${waiting}건`} flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>판매자</th>
              <th className={thClass}>정산액</th>
              <th className={thClass}>요청일</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>승인</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((item) => (
              <tr key={item.id}>
                <td className={tdClass}>
                  <span className="block font-medium text-slate-900">{item.seller}</span>
                  <span className="text-xs text-slate-400">
                    {item.email} · 거래 {item.trades}건
                  </span>
                </td>
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
                      setNotice(`${item.seller} 님의 정산 ${formatPrice(item.amount)}을 승인했어요.`);
                    }}
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:bg-slate-100 disabled:text-slate-300"
                  >
                    정산 승인
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}
