"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { useAdmin } from "@/components/spark/AdminProvider";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import type { AdminCategory, AdminCategoryKind } from "@/data/mockData";
import { SEED_BOARDS } from "@/features/admin-boards/model";

type CategoryTab = AdminCategoryKind;

const COLUMNS = [
  { level: 1 as const, title: "1·대분류", empty: null },
  { level: 2 as const, title: "2·중분류", empty: "왼쪽에서 상위 카테고리를 선택하세요" },
  { level: 3 as const, title: "3·하위", empty: "중분류를 선택하세요" },
  { level: 4 as const, title: "4·하위", empty: "3열을 선택하세요" },
] as const;

export function CategoriesAdmin() {
  const { categories, addCategory, deleteCategory } = useAdmin();
  const { products } = useSpark();
  const [tab, setTab] = useState<CategoryTab>("product");
  const [selected, setSelected] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [drafts, setDrafts] = useState(["", "", "", ""]);
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
    return [l1, l2, l3, l4] as const;
  }, [live, selected]);

  function usageCount(categoryName: string) {
    if (tab === "product") return products.filter((product) => product.category === categoryName).length;
    return SEED_BOARDS.filter((board) => board.category === categoryName || board.name === categoryName).length;
  }

  function parentIdForLevel(level: 1 | 2 | 3 | 4) {
    if (level === 1) return null;
    return selected[level - 2];
  }

  function columnEnabled(level: 1 | 2 | 3 | 4) {
    if (level === 1) return true;
    return Boolean(selected[level - 2]);
  }

  function selectAt(level: 1 | 2 | 3 | 4, id: string) {
    if (level === 4) return;
    setSelected((current) => {
      if (level === 1) return [id, null, null];
      if (level === 2) return [current[0], id, null];
      return [current[0], current[1], id];
    });
  }

  function addAt(level: 1 | 2 | 3 | 4) {
    const name = drafts[level - 1] ?? "";
    if (!name.trim()) return;
    if (!columnEnabled(level)) {
      setNotice(COLUMNS[level - 1].empty ?? "상위 카테고리를 먼저 선택하세요.");
      return;
    }
    const error = addCategory({ name, kind: tab, parentId: parentIdForLevel(level) });
    if (error) {
      setNotice(error);
      return;
    }
    setNotice(`${name.trim()}을(를) ${COLUMNS[level - 1].title}에 추가했어요.`);
    setDrafts((current) => current.map((value, index) => (index === level - 1 ? "" : value)));
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
              setDrafts(["", "", "", ""]);
              setNotice("");
            }}
            className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-sm leading-6 text-slate-500">
        1열: 대분류 → 항목 클릭 시 2열에 중분류 입력. 새 항목은 각 열 맨 위에 추가됩니다.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {COLUMNS.map((column, index) => {
          const level = column.level;
          const enabled = columnEnabled(level);
          const items = levelItems[index];
          const selectedId = level === 4 ? null : selected[level - 1];
          return (
            <section key={column.title} className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">{column.title}</h2>
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
                    value={drafts[index]}
                    onChange={(event) =>
                      setDrafts((current) => current.map((value, draftIndex) => (draftIndex === index ? event.target.value : value)))
                    }
                    disabled={!enabled}
                    placeholder={enabled ? "카테고리 이름" : "상위 선택 필요"}
                    className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  <button type="submit" disabled={!enabled || !drafts[index].trim()} className={`${primaryButtonClass} shrink-0 disabled:opacity-40`}>
                    추가
                  </button>
                </form>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {!enabled ? (
                  <p className="px-3 py-10 text-center text-sm text-slate-400">{column.empty}</p>
                ) : items.length === 0 ? (
                  <p className="px-3 py-10 text-center text-sm text-slate-400">항목이 없어요.</p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((item) => {
                      const active = selectedId === item.id;
                      const clickable = level < 4;
                      return (
                        <li key={item.id}>
                          <div
                            className={`flex items-center gap-2 rounded-xl px-2 py-1.5 ${active ? "bg-slate-900 text-white" : "hover:bg-slate-50"}`}
                          >
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
                              aria-label={`${item.name} 삭제`}
                              onClick={() => requestDelete(item)}
                              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm ${active ? "text-white/80 hover:bg-white/10" : "text-slate-400 hover:bg-slate-100 hover:text-rose-600"}`}
                            >
                              ×
                            </button>
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
