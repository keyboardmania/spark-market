"use client";

import { useState } from "react";
import { PRODUCT_FLAGS, SALE_STATUSES, formatPrice, getProductById, sellerAccount, type SaleStatus } from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { useAdmin } from "@/components/spark/AdminProvider";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { DataTable, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { useShared, type LiveReport } from "@/data/shared";

export function ProductsAdmin() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const { products, softDeleteProduct } = useSpark();
  const shared = useShared();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"전체" | SaleStatus | "금지/신고">("전체");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [notice, setNotice] = useState("");

  const flagged = new Map(PRODUCT_FLAGS.map((item) => [item.productId, item]));
  const sanctioned = shared.deletions.filter((item) => item.kind === "상품");
  const visible = products.filter((product) => {
    const seller = sellerAccount(product.sellerId);
    const needle = query.trim().toLowerCase();
    const textOk = !needle || `${product.title} ${seller.name} ${seller.email}`.toLowerCase().includes(needle);
    if (!textOk) return false;
    if (status === "전체") return true;
    if (status === "금지/신고") return isRestricted(product.id, flagged, shared.reports);
    return product.saleStatus === status;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CATALOG</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">상품·카테고리 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
        {sanctioned.length > 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            신고 수락이 3회를 초과해 삭제한 상품: {sanctioned.map((item) => getProductById(item.id)?.title ?? item.id).join(", ")}. 데이터는 남고 사진·동영상은 3개월 뒤 삭제됩니다.
          </p>
        ) : null}
      </div>
      <FilterBar>
        <FilterField label="상품 검색">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="판매자 닉네임·이메일 또는 상품명" className={fieldClass} />
        </FilterField>
        <FilterField label="판매 상태" className="sm:max-w-[180px]">
          <select value={status} onChange={(event) => setStatus(event.target.value as "전체" | SaleStatus | "금지/신고")} className={fieldClass}>
            <option value="전체">전체</option>
            {SALE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="금지/신고">금지/신고</option>
          </select>
        </FilterField>
      </FilterBar>

      <Panel
        title="등록 매물"
        description={`${visible.length}개 표시 · 예약중 상품은 삭제할 수 없고, 신고 수락이 3회를 넘으면 자동으로 내려갑니다.`}
        flush
      >
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>상품</th>
              <th className={thClass}>판매자</th>
              <th className={thClass}>카테고리</th>
              <th className={thClass}>가격</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>신고</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => {
              const flag = flagged.get(product.id);
              const seller = sellerAccount(product.sellerId);
              const strikes = acceptedStrikes(shared.reports, product.id);
              const reserved = product.saleStatus === "예약중";
              return (
                <tr key={product.id}>
                  <td className={tdClass}>
                    <span className="block font-medium text-slate-900">{product.title}</span>
                    {flag ? (
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <StatusPill tone={flag.flag === "금지" ? "rose" : "amber"}>{flag.flag}</StatusPill>
                      </span>
                    ) : null}
                  </td>
                  <td className={tdClass}>
                    <span className="block text-slate-900">{seller.name}</span>
                    <span className="text-xs text-slate-400">{seller.email}</span>
                  </td>
                  <td className={tdClass}>{product.category}</td>
                  <td className={`${tdClass} tabular-nums`}>{formatPrice(product.price)}</td>
                  <td className={tdClass}>
                    <SaleStatusText status={product.saleStatus} />
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{strikes > 0 ? `수락 ${strikes}회` : "—"}</td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      onClick={() => {
                        if (reserved) {
                          setNotice("예약중인 상품은 삭제할 수 없어요.");
                          return;
                        }
                        softDeleteProduct(product.id);
                        setNotice(`${product.title} 매물을 삭제했어요. 데이터는 남고 사진·동영상은 3개월 후 삭제됩니다.`);
                      }}
                      className={reserved ? "rounded-full px-3 py-1.5 text-xs text-slate-400" : flag || strikes > 3 ? "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700" : "rounded-full px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"}
                    >
                      {reserved ? "삭제 불가" : flag ? `${flag.flag} 매물 삭제` : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={7}>
                  조건에 맞는 매물이 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
      </Panel>

      <Panel title="카테고리" description="추가, 이름 수정, 삭제가 목록에 바로 반영됩니다.">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const name = draft.trim();
            if (!name) return;
            if (categories.some((item) => item.name.localeCompare(name, "en", { sensitivity: "base" }) === 0)) {
              setNotice("이미 있는 카테고리 이름은 등록할 수 없어요.");
              return;
            }
            addCategory(name);
            setNotice(`${name} 카테고리를 추가했어요.`);
            setDraft("");
          }}
        >
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="새 카테고리 이름" className={fieldClass} />
          <button type="submit" className={primaryButtonClass} disabled={!draft.trim()}>
            추가
          </button>
        </form>
        <ul className="mt-4 divide-y divide-slate-100">
          {categories.map((category) => {
            const count = products.filter((product) => product.category === category.name).length;
            const editing = editingId === category.id;
            return (
              <li key={category.id} className="flex flex-wrap items-center gap-3 py-3">
                {editing ? (
                  <input value={editingName} onChange={(event) => setEditingName(event.target.value)} className={`${fieldClass} max-w-xs`} />
                ) : (
                  <div className="min-w-40 flex-1">
                    <p className="text-sm font-medium text-slate-900">{category.name}</p>
                    <p className="text-xs text-slate-400">
                      /{category.slug} · 매물 {count}개
                    </p>
                  </div>
                )}
                {editing ? (
                  <button
                    type="button"
                    className={primaryButtonClass}
                    onClick={() => {
                      updateCategory(category.id, editingName);
                      setEditingId(null);
                      setNotice("카테고리 이름을 수정했어요.");
                    }}
                  >
                    저장
                  </button>
                ) : (
                  <button
                    type="button"
                    className={ghostButtonClass}
                    onClick={() => {
                      setEditingId(category.id);
                      setEditingName(category.name);
                    }}
                  >
                    수정
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50"
                  onClick={() => {
                    if (count > 0) {
                      setNotice("등록된 상품이 있는 카테고리는 삭제할 수 없어요.");
                      return;
                    }
                    deleteCategory(category.id);
                    setNotice(`${category.name} 카테고리를 삭제했어요.`);
                  }}
                >
                  삭제
                </button>
              </li>
            );
          })}
          {categories.length === 0 ? <li className="py-4 text-sm text-slate-400">등록된 카테고리가 없어요.</li> : null}
        </ul>
      </Panel>
    </div>
  );
}

function acceptedStrikes(reports: LiveReport[], productId: string) {
  return reports.filter((report) => report.status === "수락" && report.category === "상품" && report.targetId === productId).length;
}

function isRestricted(productId: string, flagged: Map<string, { flag: "신고" | "금지" }>, reports: LiveReport[]) {
  if (flagged.has(productId)) return true;
  return reports.some((report) => report.category === "상품" && report.targetId === productId && report.status !== "거절");
}
