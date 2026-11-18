"use client";

import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import type { BoardRecord } from "@/features/admin-boards/model";

export function BoardList({
  boards,
  selectedId,
  onSelect,
}: {
  boards: BoardRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const page = useAdminPage(boards.length, boards.map((board) => board.id).join(","));
  const rows = boards.slice(page.start, page.start + page.pageSize);
  return (
    <>
      <ul className="flex flex-col">
        {rows.map((board) => (
          <li key={board.id} className={board.id === selectedId ? "bg-slate-50" : undefined}>
            <button type="button" onClick={() => onSelect(board.id)} className="flex w-full flex-col gap-1 px-5 py-3 text-left">
              <span className="text-xs text-slate-400">{board.category}</span>
              <span className="text-sm font-medium text-slate-900">{board.name}</span>
              <span className="text-[11px] text-slate-500">사용 여부 · {board.used ? "사용" : "미사용"}</span>
              <span className="text-xs text-slate-500">
                {[
                  board.userWrite ? "사용자 작성 가능" : "운영자 작성",
                  board.media ? "미디어" : "미디어 없음",
                  board.fixed ? "고정" : "고정 없음",
                ].join(" · ")}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <AdminPager page={page.page} pageCount={page.pageCount} total={page.total} pageSize={page.pageSize} onPage={page.setPage} />
    </>
  );
}
