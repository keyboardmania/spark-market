"use client";

import { useState } from "react";
import { PRODUCT_FLAGS, formatPrice } from "@/data/mockData";
import { ConditionBadge, SaleStatusText } from "@/components/spark/Badges";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function ProductsAdmin() {
  const { products, removeProduct, categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [filter, setFilter] = useState<"전체" | "금지·신고">("전체");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [notice, setNotice] = useState("");

  const flagged = new Map(PRODUCT_FLAGS.map((item) => [item.productId, item]));
  const visible = products.filter((product) => filter === "전체" || flagged.has(product.id));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CATALOG</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">상품/카테고리 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>

      <Panel
        title="등록 매물"
        description={`${products.length}개 노출 중`}
        flush
        action={
          <div className="flex rounded-full bg-slate-50 p-1 text-xs">
            {(["전체", "금지·신고"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1.5 ${filter === item ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-400"}`}
              >
                {item}
              </button>
            ))}
          </div>
        }
      >
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>상품</th>
              <th className={thClass}>카테고리</th>
              <th className={thClass}>가격</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => {
              const flag = flagged.get(product.id);
              return (
                <tr key={product.id}>
                  <td className={tdClass}>
                    <span className="block font-medium text-slate-900">{product.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {product.ip}
                      <ConditionBadge condition={product.condition} />
                      {flag ? <StatusPill tone={flag.flag === "금지" ? "rose" : "amber"}>{flag.flag}</StatusPill> : null}
                    </span>
                  </td>
                  <td className={tdClass}>{product.category}</td>
                  <td className={`${tdClass} tabular-nums`}>{formatPrice(product.price)}</td>
                  <td className={tdClass}>
                    <SaleStatusText status={product.saleStatus} />
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      onClick={() => {
                        removeProduct(product.id);
                        setNotice(`${product.title} 매물을 삭제했어요.`);
                      }}
                      className={flag ? "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700" : "rounded-full px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"}
                    >
                      {flag ? `${flag.flag} 매물 삭제` : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={5}>
                  표시할 매물이 없어요.
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
            if (!draft.trim()) return;
            addCategory(draft);
            setNotice(`${draft.trim()} 카테고리를 추가했어요.`);
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
