"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { useAdmin } from "@/components/spark/AdminProvider";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import type { AdminCategory, AdminCategoryKind } from "@/data/mockData";
import { SEED_BOARDS } from "@/features/admin-boards/model";

type CategoryTab = AdminCategoryKind;
type Level = 1 | 2 | 3 | 4;

const COLUMN_TITLES: Record<Level, string> = {
  1: "1·대분류",
  2: "2·중분류(국가)",
  3: "3·하위 분류",
  4: "4·하위 분류",
};

export function CategoriesAdmin() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdmin();
  const { products } = useSpark();
  const [tab, setTab] = useState<CategoryTab>("product");
  const [selected, setSelected] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [drafts, setDrafts] = useState<Record<Level, string>>({ 1: "", 2: "", 3: "", 4: "" });
  const [forceLevel, setForceLevel] = useState<{ 3: boolean; 4: boolean }>({ 3: false, 4: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  const live = useMemo(
    () => categories.filter((item) => item.kind === tab && !item.deletedAt),
    [categories, tab],
  );

  const levelItems = useMemo(() => {
    const l1 = live.filter((item) => item.parentId === null);
    const l2 = selected[0] ? live.filter((item) => item.parentId === selected[0]) : [];
    const l3 = selected[1] ? live.filter((item) => item.parentId === selected[1]) : [];
    const l4 = selected[2] ? live.filter((item) => item.parentId === selected[2]) : [];
    return { 1: l1, 2: l2, 3: l3, 4: l4 } as const;
  }, [live, selected]);

  const showLevel3 = Boolean(selected[1]) && (levelItems[3].length > 0 || forceLevel[3] || Boolean(selected[2]));
  const showLevel4 = Boolean(selected[2]) && (levelItems[4].length > 0 || forceLevel[4]);
  const visibleLevels: Level[] = [1, 2, ...(showLevel3 ? ([3] as Level[]) : []), ...(showLevel4 ? ([4] as Level[]) : [])];

  function usageCount(categoryName: string) {
    if (tab === "product") return products.filter((product) => product.category === categoryName).length;
    return SEED_BOARDS.filter((board) => board.category === categoryName || board.name === categoryName).length;
  }

  function parentIdForLevel(level: Level) {
    if (level === 1) return null;
    return selected[level - 2];
  }

  function columnEnabled(level: Level) {
    if (level === 1) return true;
    return Boolean(selected[level - 2]);
  }

  function selectAt(level: Level, id: string) {
    if (level === 4) return;
    setEditingId(null);
    setSelected((current) => {
      if (level === 1) {
        setForceLevel({ 3: false, 4: false });
        return [id, null, null];
      }
      if (level === 2) {
        setForceLevel((prev) => ({ 3: prev[3], 4: false }));
        return [current[0], id, null];
      }
      return [current[0], current[1], id];
    });
  }

  function unlockChildLevel(fromLevel: 2 | 3) {
    if (fromLevel === 2) {
      if (!selected[1]) {
        setNotice("중분류를 선택한 뒤 하위 분류를 추가하세요.");
        return;
      }
      setForceLevel((prev) => ({ ...prev, 3: true }));
      setNotice("3분류 열을 열었어요. 이름을 입력해 추가하세요.");
      return;
    }
    if (!selected[2]) {
      setNotice("3분류를 선택한 뒤 하위 분류를 추가하세요.");
      return;
    }
    setForceLevel((prev) => ({ ...prev, 4: true }));
    setNotice("4분류 열을 열었어요. 이름을 입력해 추가하세요.");
  }

  function addAt(level: Level) {
    const name = drafts[level] ?? "";
    if (!name.trim()) return;
    if (!columnEnabled(level)) {
      setNotice("상위 카테고리를 먼저 선택하세요.");
      return;
    }
    const error = addCategory({ name, kind: tab, parentId: parentIdForLevel(level) });
    if (error) {
      setNotice(error);
      return;
    }
    setNotice(`${name.trim()}을(를) ${COLUMN_TITLES[level]}에 추가했어요.`);
    setDrafts((current) => ({ ...current, [level]: "" }));
  }

  function startEdit(item: AdminCategory) {
    setEditingId(item.id);
    setEditName(item.name);
  }

  function saveEdit() {
    if (!editingId) return;
    const error = updateCategory(editingId, editName);
    if (error) {
      setNotice(error);
      return;
    }
    setNotice("카테고리 이름을 수정했어요.");
    setEditingId(null);
    setEditName("");
  }

  function requestDelete(category: AdminCategory) {
    const count = usageCount(category.name);
    const hasChildren = live.some((item) => item.parentId === category.id);
    if (hasChildren) {
      setNotice("하위 카테고리가 있으면 삭제할 수 없어요.");
      return;
    }
    if (count > 0) {
      setNotice(tab === "product" ? "등록된 상품이 있는 카테고리는 삭제할 수 없어요." : "등록된 게시글이 있는 카테고리는 삭제할 수 없어요.");
      return;
    }
    setPendingDelete(category);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const count = usageCount(pendingDelete.name);
    const error = deleteCategory(pendingDelete.id, tab === "product" ? count : 0, tab === "board" ? count : 0);
    if (error) {
      setNotice(error);
      setPendingDelete(null);
      return;
    }
    setSelected((current) =>
      current.map((id) => (id === pendingDelete.id ? null : id)) as [string | null, string | null, string | null],
    );
    setNotice(`${pendingDelete.name} 카테고리를 삭제(숨김) 처리했어요.`);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CATEGORIES</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">카테고리 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="카테고리 구분">
        {(
          [
            ["product", "상품 카테고리"],
            ["board", "게시판 카테고리"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setSelected([null, null, null]);
              setDrafts({ 1: "", 2: "", 3: "", 4: "" });
              setForceLevel({ 3: false, 4: false });
              setEditingId(null);
              setNotice("");
            }}
            className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        {tab === "product"
          ? "1분류는 대분류, 2분류는 국가 데이터입니다. 3·4분류는 [하위 분류 추가]로 필요할 때만 엽니다. 동일 상위 안에서 이름은 중복될 수 없습니다."
          : "1·2분류를 선택한 뒤 [하위 분류 추가]로 3·4분류를 엽니다. 동일 상위 안에서 이름은 중복될 수 없습니다."}
      </p>

      <div className={`grid gap-4 ${visibleLevels.length >= 3 ? "xl:grid-cols-2" : "md:grid-cols-2"}`}>
        {visibleLevels.map((level) => {
          const enabled = columnEnabled(level);
          const items = levelItems[level];
          const selectedId = level === 4 ? null : selected[level - 1];
          const title = tab === "product" && level === 2 ? "2·중분류(국가)" : level === 2 ? "2·중분류" : COLUMN_TITLES[level];
          const canUnlockChild = level === 2 || level === 3;
          const nextVisible = level === 2 ? showLevel3 : level === 3 ? showLevel4 : true;

          return (
            <section key={level} className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                {canUnlockChild && selectedId && !nextVisible ? (
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    onClick={() => unlockChildLevel(level)}
                  >
                    하위 분류 추가
                  </button>
                ) : null}
              </header>

              <div className="border-b border-slate-100 px-3 py-3">
                <form
                  className="flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    addAt(level);
                  }}
                >
                  <input
                    value={drafts[level]}
                    onChange={(event) => setDrafts((current) => ({ ...current, [level]: event.target.value }))}
                    disabled={!enabled}
                    placeholder={enabled ? "카테고리 이름" : "상위 선택 필요"}
                    className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  <button type="submit" disabled={!enabled || !drafts[level].trim()} className={`${primaryButtonClass} shrink-0 disabled:opacity-40`}>
                    추가
                  </button>
                </form>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {!enabled ? (
                  <p className="px-3 py-10 text-center text-sm text-slate-400">왼쪽에서 상위 카테고리를 선택하세요</p>
                ) : items.length === 0 ? (
                  <p className="px-3 py-10 text-center text-sm text-slate-400">항목이 없어요.</p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((item) => {
                      const active = selectedId === item.id;
                      const editing = editingId === item.id;
                      const clickable = level < 4;
                      return (
                        <li key={item.id}>
                          <div className={`flex items-center gap-1 rounded-xl px-2 py-1.5 ${active ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}>
                            {editing ? (
                              <form
                                className="flex min-w-0 flex-1 gap-1"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  saveEdit();
                                }}
                              >
                                <input
                                  value={editName}
                                  onChange={(event) => setEditName(event.target.value)}
                                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900"
                                  autoFocus
                                />
                                <button type="submit" className={`${primaryButtonClass} !px-2 !py-1 text-xs`}>
                                  저장
                                </button>
                                <button
                                  type="button"
                                  className={`${ghostButtonClass} !px-2 !py-1 text-xs ${active ? "!border-white/30 !text-white" : ""}`}
                                  onClick={() => setEditingId(null)}
                                >
                                  취소
                                </button>
                              </form>
                            ) : (
                              <>
                                {clickable ? (
                                  <button
                                    type="button"
                                    onClick={() => selectAt(level, item.id)}
                                    className={`min-w-0 flex-1 truncate px-1 text-left text-sm ${active ? "font-medium text-white" : "text-slate-800"}`}
                                  >
                                    {item.name}
                                  </button>
                                ) : (
                                  <span className="min-w-0 flex-1 truncate px-1 text-sm text-slate-800">{item.name}</span>
                                )}
                                <button
                                  type="button"
                                  aria-label={`${item.name} 수정`}
                                  onClick={() => startEdit(item)}
                                  className={`rounded-full px-2 py-1 text-[11px] ${active ? "text-white/80 hover:bg-white/10" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  aria-label={`${item.name} 삭제`}
                                  onClick={() => requestDelete(item)}
                                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${active ? "text-white/80 hover:bg-white/10" : "text-slate-400 hover:bg-slate-100 hover:text-rose-600"}`}
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {pendingDelete ? (
        <ConfirmDialog
          title="삭제하시겠습니까?"
          body={`${pendingDelete.name} 카테고리를 삭제(숨김)합니다. 하위 카테고리와 등록 콘텐츠가 없을 때만 가능합니다.`}
          confirmLabel="삭제"
          cancelLabel="취소"
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
