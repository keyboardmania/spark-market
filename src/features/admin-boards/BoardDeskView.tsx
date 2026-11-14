"use client";

import { BoardForm } from "@/features/admin-boards/BoardForm";
import { BoardList } from "@/features/admin-boards/BoardList";
import { useBoardDesk } from "@/features/admin-boards/useBoardDesk";
import { Panel } from "@/components/spark/admin/ui";

export function BoardDeskView() {
  const desk = useBoardDesk();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">BOARDS</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">게시판 관리</h1>
      </header>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="게시판 목록" description="카테고리, 이름, 작성 권한, 미디어 사용을 조회합니다." flush>
          <BoardList boards={desk.boards} selectedId={desk.selectedId} onSelect={desk.select} />
        </Panel>
        <Panel title="게시판 폼" description="등록, 수정, 삭제는 서로 다른 버튼입니다.">
          <BoardForm
            draft={desk.draft}
            selected={Boolean(desk.selectedId)}
            notice={desk.notice}
            onChange={desk.setDraft}
            onCreate={desk.create}
            onUpdate={desk.update}
            onDelete={desk.remove}
            onClear={desk.clear}
          />
        </Panel>
      </div>
    </div>
  );
}
