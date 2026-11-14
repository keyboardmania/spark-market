"use client";

import Link from "next/link";
import { useShared } from "@/data/shared";
import { boardHref } from "@/features/support/boards/BoardFeedView";

export function SupportView() {
  const boards = useShared().boards.filter((board) => board.used);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SUPPORT</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">고객센터</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">공지, FAQ, 문의, 이벤트는 각 게시판에서 확인해요.</p>
      </div>
      <ul className="mt-8 flex flex-col overflow-hidden rounded-2xl border border-slate-200">
        {boards.map((board) => (
          <li key={board.id} className="border-b border-slate-100 last:border-b-0">
            <Link href={boardHref(board.id)} className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-slate-50">
              <span>
                <span className="block text-sm font-medium text-slate-900">{board.name}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  {board.category} · {board.userWrite ? "회원 작성" : "운영자 작성"}
                </span>
              </span>
              <span className="text-slate-300" aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
