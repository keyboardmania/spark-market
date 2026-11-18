"use client";

import { useState } from "react";
import { BoardForm } from "@/features/admin-boards/BoardForm";
import { BoardList } from "@/features/admin-boards/BoardList";
import { useBoardDesk } from "@/features/admin-boards/useBoardDesk";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { Panel } from "@/components/spark/admin/ui";

export function BoardDeskView() {
  const desk = useBoardDesk();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">BOARDS</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">게시판 관리</h1>
      </header>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="게시판 목록" description="카테고리, 이름, 사용자 작성 가능 여부, 사용 여부를 조회합니다." flush>
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
            onDelete={() => {
              if (!desk.selectedId) return;
              setConfirmDelete(true);
            }}
            onClear={desk.clear}
          />
        </Panel>
      </div>

      {confirmDelete ? (
        <ConfirmDialog
          title="게시판 삭제"
          body="게시판을 삭제하시겠습니까?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={() => {
            desk.remove();
            setConfirmDelete(false);
          }}
          onClose={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
}
