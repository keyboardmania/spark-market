"use client";

import { useMemo, useState } from "react";
import type { Faq } from "@/data/mockData";
import { addFaq, softDeleteFaq, updateFaq, useShared } from "@/data/shared";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, DetailModal, DetailRows, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { formValuesToFaqPatch, FaqFormModal, type FaqFormValues } from "@/features/admin-faqs/FaqFormModal";
import { todayDisplayDate } from "@/features/admin-notices/datetime";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export function FaqsAdmin() {
  const shared = useShared();
  const [toast, setToast] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [detail, setDetail] = useState<Faq | null>(null);
  const [deleting, setDeleting] = useState<Faq | null>(null);

  const liveFaqs = useMemo(
    () =>
      shared.faqs
        .filter((item) => !item.deletedAt)
        .slice()
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [shared.faqs],
  );

  const faqPage = useAdminPage(liveFaqs.length, "faqs");
  const faqRows = liveFaqs.slice(faqPage.start, faqPage.start + faqPage.pageSize);

  function openCreate() {
    setEditing(null);
    setFormMode("create");
  }

  function openEdit(item: Faq) {
    setEditing(item);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditing(null);
  }

  function handleSubmit(values: FaqFormValues) {
    const patch = formValuesToFaqPatch(values);
    if (formMode === "edit" && editing) {
      updateFaq(editing.id, patch);
      setToast("FAQ를 수정했어요.");
    } else {
      addFaq({
        id: crypto.randomUUID(),
        createdAt: todayDisplayDate(),
        deletedAt: null,
        ...patch,
      });
      setToast("FAQ를 등록했어요.");
    }
    closeForm();
  }

  function confirmDelete() {
    if (!deleting) return;
    softDeleteFaq(deleting.id);
    setToast("FAQ를 삭제했어요.");
    if (detail?.id === deleting.id) setDetail(null);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">FAQ</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">FAQ 관리</h1>
          {toast ? <p className="mt-2 text-sm text-slate-500">{toast}</p> : null}
        </div>
        <button type="button" className={primaryButtonClass} onClick={openCreate}>
          FAQ 추가
        </button>
      </div>

      <Panel title="FAQ 목록" description="행을 누르면 상세를 볼 수 있어요. 삭제는 숨김 처리입니다." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>질문</th>
              <th className={thClass}>카테고리</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>노출</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {faqRows.map((item) => (
              <tr key={item.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setDetail(item)}>
                <td className={`${tdClass} font-medium text-slate-900`}>{item.question}</td>
                <td className={tdClass}>{item.category}</td>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={tdClass}>
                  <StatusPill tone={item.visible ? "emerald" : "slate"}>{item.visible ? "노출" : "비노출"}</StatusPill>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-white"
                      onClick={() => openEdit(item)}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-white"
                      onClick={() => setDeleting(item)}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {liveFaqs.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={5}>
                  등록된 FAQ가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager
          page={faqPage.page}
          pageCount={faqPage.pageCount}
          total={faqPage.total}
          pageSize={faqPage.pageSize}
          onPage={faqPage.setPage}
        />
      </Panel>

      {formMode ? (
        <FaqFormModal
          mode={formMode}
          initial={formMode === "edit" ? editing : null}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detail ? (
        <DetailModal title="FAQ 상세" onClose={() => setDetail(null)} wide>
          <DetailRows
            rows={[
              { label: "질문", value: detail.question },
              { label: "카테고리", value: detail.category },
              { label: "작성일", value: detail.createdAt },
              { label: "노출", value: detail.visible ? "노출" : "비노출" },
            ]}
          />
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400">답변</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{detail.answer}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} onClick={() => setDetail(null)}>
              닫기
            </button>
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => setDeleting(detail)}
            >
              삭제
            </button>
            <button
              type="button"
              className={primaryButtonClass}
              onClick={() => {
                openEdit(detail);
                setDetail(null);
              }}
            >
              수정
            </button>
          </div>
        </DetailModal>
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="FAQ 삭제"
          body="FAQ를 삭제하시겠습니까?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
