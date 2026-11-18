"use client";

import { useMemo, useState } from "react";
import { formatPrice, getProductById, type AdminTrade, type AdminTradeStatus } from "@/data/mockData";
import { useAdmin } from "@/components/spark/AdminProvider";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, DetailModal, DetailRows, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

const PHASES = ["진행 중", "구매 확정", "취소"] as const;
type TradePhase = (typeof PHASES)[number];

export function TradesAdmin() {
  const { trades, setTradeStatus } = useAdmin();
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"전체" | TradePhase>("전체");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = trades.filter((trade) => {
    const needle = email.trim().toLowerCase();
    const emailMatch = !needle || `${trade.buyerEmail} ${trade.sellerEmail}`.toLowerCase().includes(needle);
    return emailMatch && (status === "전체" || tradePhase(trade.status) === status);
  });
  const selected = trades.find((trade) => trade.id === selectedId) ?? null;
  const tradePage = useAdminPage(shown.length, `${email}:${status}`);
  const tradeRows = shown.slice(tradePage.start, tradePage.start + tradePage.pageSize);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">TRADES</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">거래 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="구매자·판매자 이메일" className={`${fieldClass} max-w-xs`} />
        <select value={status} onChange={(event) => setStatus(event.target.value as "전체" | TradePhase)} className={`${fieldClass} max-w-[160px]`}>
          <option value="전체">전체 상태</option>
          {PHASES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <Panel title="거래 내역" description="행을 누르면 상품, 결제, 주소, 정산 정보를 볼 수 있어요." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>판매자 이메일</th>
              <th className={thClass}>구매자 이메일</th>
              <th className={thClass}>거래 상태</th>
              <th className={thClass}>거래 금액</th>
              <th className={thClass}>상품명</th>
              <th className={thClass}>상세</th>
            </tr>
          </thead>
          <tbody>
            {tradeRows.map((trade) => {
              const phase = tradePhase(trade.status);
              return (
                <tr key={trade.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(trade.id)}>
                  <td className={tdClass}>{trade.sellerEmail}</td>
                  <td className={tdClass}>{trade.buyerEmail}</td>
                  <td className={tdClass}>
                    <StatusPill tone={phase === "취소" ? "slate" : phase === "구매 확정" ? "emerald" : "sky"}>
                      {trade.status === "취소(환불)" ? "취소(환불)" : phase}
                    </StatusPill>
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{formatPrice(trade.amount)}</td>
                  <td className={`${tdClass} font-medium text-slate-900`}>{trade.title}</td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(trade.id);
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={6}>
                  표시할 거래가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={tradePage.page} pageCount={tradePage.pageCount} total={tradePage.total} pageSize={tradePage.pageSize} onPage={tradePage.setPage} />
      </Panel>
      {selected ? (
        <TradeDetail
          trade={selected}
          onClose={() => setSelectedId(null)}
          onStatus={(next) => {
            setTradeStatus(selected.id, next);
            setNotice(
              next === "취소(환불)"
                ? `${selected.id} 거래를 취소(환불)로 바꿨어요.`
                : `${selected.id} 거래를 취소했어요.`,
            );
          }}
        />
      ) : null}
    </div>
  );
}

function TradeDetail({ trade, onClose, onStatus }: { trade: AdminTrade; onClose: () => void; onStatus: (status: AdminTradeStatus) => void }) {
  const close = useMemo(() => onClose, [onClose]);
  const product = getProductById(trade.productId);
  const image = product?.imageUrl;
  const cancelled = trade.status === "거래취소" || trade.status === "취소(환불)";
  return (
    <DetailModal title="거래 상세" onClose={close} wide>
      <div className="mb-4 flex gap-4">
        {image ? <img src={image} alt="" className="h-24 w-24 rounded-xl object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">사진 없음</div>}
        <div>
          <p className="text-sm font-medium text-slate-900">{trade.title}</p>
          <p className="mt-1 text-xs text-slate-400">{trade.id}</p>
        </div>
      </div>
      <DetailRows
        rows={[
          { label: "판매자", value: `${trade.seller} · ${trade.sellerEmail}` },
          { label: "구매자", value: `${trade.buyer} · ${trade.buyerEmail}` },
          { label: "상품명", value: trade.title },
          { label: "거래 상태", value: `${tradePhase(trade.status)} (${trade.status})` },
          { label: "거래 금액", value: formatPrice(trade.amount) },
          { label: "결제 방식", value: trade.paymentMethod },
          { label: "판매자 주소", value: trade.sellerAddress },
          { label: "구매자 주소", value: trade.buyerAddress },
          { label: "정산 정보", value: `${trade.settlement.status} · ${formatPrice(trade.settlement.amount)} · ${trade.settlement.holderEn} · ${trade.settlement.account} · ${trade.settlement.bankEn} · ${trade.settlement.bankCode}` },
        ]}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={cancelled}
          onClick={() => onStatus("거래취소")}
          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:text-slate-300"
        >
          거래 취소
        </button>
      </div>
    </DetailModal>
  );
}

function tradePhase(status: AdminTradeStatus): TradePhase {
  if (status === "구매확정") return "구매 확정";
  if (status === "거래취소" || status === "취소(환불)") return "취소";
  return "진행 중";
}
