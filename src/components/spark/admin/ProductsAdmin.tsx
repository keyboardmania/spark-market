"use client";

import Link from "next/link";
import { useState } from "react";
import { PRODUCT_FLAGS, SALE_STATUSES, formatPrice, getProductById, sellerAccount, type SaleStatus } from "@/data/mockData";
import { SaleStatusText } from "@/components/spark/Badges";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass } from "@/components/spark/styles";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { useShared, type LiveReport } from "@/data/shared";
import { DELETE_BLOCKED_MESSAGE, productDeleteBlock } from "@/features/trade/productGuards";

export function ProductsAdmin() {
  const { products, rooms, orders, softDeleteProduct } = useSpark();
  const shared = useShared();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"전체" | SaleStatus | "금지/신고">("전체");
  const [notice, setNotice] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
  const productPage = useAdminPage(visible.length, `${query}:${status}`);
  const productRows = visible.slice(productPage.start, productPage.start + productPage.pageSize);
  const pending = products.find((product) => product.id === pendingDeleteId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CATALOG</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">상품 관리</h1>
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
        description={`${visible.length}개 표시 · 제목을 누르면 구매자용 상품 상세로 이동합니다.`}
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
            {productRows.map((product) => {
              const flag = flagged.get(product.id);
              const seller = sellerAccount(product.sellerId);
              const strikes = acceptedStrikes(shared.reports, product.id);
              const block = productDeleteBlock(product, rooms, orders);
              return (
                <tr key={product.id}>
                  <td className={tdClass}>
                    <Link href={`/products/${product.id}`} className="block font-medium text-slate-900 underline-offset-4 hover:underline">
                      {product.title}
                    </Link>
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
                        if (block) {
                          setNotice(DELETE_BLOCKED_MESSAGE);
                          return;
                        }
                        setPendingDeleteId(product.id);
                      }}
                      className={block ? "rounded-full px-3 py-1.5 text-xs text-slate-400" : flag || strikes > 3 ? "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700" : "rounded-full px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"}
                    >
                      {block ? "삭제 불가" : flag ? `${flag.flag} 매물 삭제` : "삭제"}
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
        <AdminPager page={productPage.page} pageCount={productPage.pageCount} total={productPage.total} pageSize={productPage.pageSize} onPage={productPage.setPage} />
      </Panel>

      {pending ? (
        <ConfirmDialog
          title="삭제하시겠습니까?"
          body={`${pending.title} 매물을 삭제합니다. 데이터는 남고 사진·동영상은 3개월 후 삭제됩니다.`}
          confirmLabel="삭제"
          cancelLabel="취소"
          onClose={() => setPendingDeleteId(null)}
          onConfirm={() => {
            const removed = softDeleteProduct(pending.id);
            setPendingDeleteId(null);
            if (!removed) {
              setNotice(DELETE_BLOCKED_MESSAGE);
              return;
            }
            setNotice(`${pending.title} 매물을 삭제했어요.`);
          }}
        />
      ) : null}
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
