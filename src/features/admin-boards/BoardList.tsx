"use client";

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
  return (
    <ul className="flex flex-col">
      {boards.map((board) => (
        <li key={board.id} className={board.id === selectedId ? "bg-slate-50" : undefined}>
          <button type="button" onClick={() => onSelect(board.id)} className="flex w-full flex-col gap-1 px-5 py-3 text-left">
            <span className="text-xs text-slate-400">{board.category}{board.used ? "" : " · 미사용"}</span>
            <span className="text-sm font-medium text-slate-900">{board.name}</span>
            <span className="text-xs text-slate-500">
              {[
                board.userWrite ? "유저 작성" : "운영자 작성",
                board.media ? "미디어" : "미디어 없음",
                board.fixed ? "고정" : "고정 없음",
              ].join(" · ")}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
