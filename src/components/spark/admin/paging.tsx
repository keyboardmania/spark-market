"use client";

import { useState } from "react";

export const ADMIN_PAGE_SIZE = 20;

export type AdminPageQuery = {
  page: number;
  pageSize: number;
};

export function useAdminPage(total: number, resetKey: string, pageSize = ADMIN_PAGE_SIZE) {
  const [batch, setBatch] = useState({ key: resetKey, page: 1 });
  const stored = batch.key === resetKey ? batch.page : 1;
  const pageCount = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = Math.min(Math.max(1, stored), pageCount);
  const start = (page - 1) * pageSize;
  const query: AdminPageQuery = { page, pageSize };

  function setPage(next: number) {
    setBatch({ key: resetKey, page: next });
  }

  return { page, pageSize, pageCount, start, total, setPage, query };
}

export function AdminPager({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500" aria-label="목록 페이지" data-page={page} data-page-size={pageSize}>
      <p>
        {total}건 · page {page} / {pageCount} · pageSize {pageSize}
      </p>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-full border border-slate-200 px-3 py-1.5 disabled:text-slate-300">
          이전
        </button>
        <button type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)} className="rounded-full border border-slate-200 px-3 py-1.5 disabled:text-slate-300">
          다음
        </button>
      </div>
    </nav>
  );
}
