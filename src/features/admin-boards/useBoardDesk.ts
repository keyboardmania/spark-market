"use client";

import { useState } from "react";
import { addBoard, removeBoard, updateBoard, useShared } from "@/data/shared";
import { EMPTY_BOARD_DRAFT, type BoardDraft } from "@/features/admin-boards/model";

export function useBoardDesk() {
  const boards = useShared().boards;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BoardDraft>(EMPTY_BOARD_DRAFT);
  const [notice, setNotice] = useState("");

  function select(id: string) {
    const found = boards.find((item) => item.id === id);
    if (!found) return;
    setSelectedId(id);
    setDraft({
      category: found.category,
      name: found.name,
      userWrite: found.userWrite,
      media: found.media,
      fixed: found.fixed,
      reservation: found.reservation,
      used: found.used,
    });
    setNotice("");
  }

  function clear() {
    setSelectedId(null);
    setDraft(EMPTY_BOARD_DRAFT);
  }

  function create() {
    const name = draft.name.trim();
    const category = draft.category.trim();
    if (!name || !category) return;
    const result = addBoard({ ...draft, name, category });
    if (result === "duplicate") {
      setNotice("같은 이름의 게시판이 있어요.");
      return;
    }
    clear();
    setNotice("게시판을 등록했어요.");
  }

  function update() {
    if (!selectedId) return;
    const name = draft.name.trim();
    const category = draft.category.trim();
    if (!name || !category) return;
    updateBoard(selectedId, { ...draft, name, category });
    setNotice("게시판을 수정했어요.");
  }

  function remove() {
    if (!selectedId) return;
    removeBoard(selectedId);
    clear();
    setNotice("게시판을 삭제했어요.");
  }

  return { boards, selectedId, draft, setDraft, notice, select, clear, create, update, remove };
}
