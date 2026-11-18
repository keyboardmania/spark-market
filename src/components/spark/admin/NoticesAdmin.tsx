"use client";

import { useMemo, useState } from "react";
import type { Notice } from "@/data/mockData";
import { addNotice, softDeleteNotice, updateNotice, useShared } from "@/data/shared";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, DetailModal, DetailRows, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { formValuesToNoticePatch, NoticeFormModal, type NoticeFormValues } from "@/features/admin-notices/NoticeFormModal";
import { todayDisplayDate } from "@/features/admin-notices/datetime";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export function NoticesAdmin() {
  const shared = useShared();
  const [toast, setToast] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [detail, setDetail] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState<Notice | null>(null);

  const liveNotices = useMemo(
    () =>
      shared.notices
        .filter((item) => !item.deletedAt)
        .slice()
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.createdAt.localeCompare(a.createdAt);
        }),
    [shared.notices],
  );

  const noticePage = useAdminPage(liveNotices.length, "notices");
  const noticeRows = liveNotices.slice(noticePage.start, noticePage.start + noticePage.pageSize);

  function openCreate() {
    setEditing(null);
    setFormMode("create");
  }

  function openEdit(item: Notice) {
    setEditing(item);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditing(null);
  }

  function handleSubmit(values: NoticeFormValues) {
    const patch = formValuesToNoticePatch(values);
    if (formMode === "edit" && editing) {
      updateNotice(editing.id, patch);
      setToast("공지를 수정했어요.");
    } else {
      addNotice({
        id: crypto.randomUUID(),
        createdAt: todayDisplayDate(),
        deletedAt: null,
        ...patch,
      });
      setToast("공지를 등록했어요.");
    }
    closeForm();
  }

  function confirmDelete() {
    if (!deleting) return;
    softDeleteNotice(deleting.id);
    setToast("공지를 삭제했어요.");
    if (detail?.id === deleting.id) setDetail(null);
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">NOTICES</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">공지사항 관리</h1>
          {toast ? <p className="mt-2 text-sm text-slate-500">{toast}</p> : null}
        </div>
        <button type="button" className={primaryButtonClass} onClick={openCreate}>
          공지 추가
        </button>
      </div>

      <Panel title="공지 목록" description="행을 누르면 상세를 볼 수 있어요. 삭제는 숨김 처리입니다." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>제목</th>
              <th className={thClass}>작성일</th>
              <th className={thClass}>노출</th>
              <th className={thClass}>고정</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {noticeRows.map((item) => (
              <tr
                key={item.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => setDetail(item)}
              >
                <td className={`${tdClass} font-medium text-slate-900`}>
                  <span className="block">{item.title}</span>
                  <span className="text-xs font-normal text-slate-400">{item.category}</span>
                </td>
                <td className={`${tdClass} tabular-nums`}>{item.createdAt}</td>
                <td className={tdClass}>
                  <StatusPill tone={item.visible ? "emerald" : "slate"}>{item.visible ? "노출" : "비노출"}</StatusPill>
                </td>
                <td className={tdClass}>
                  <StatusPill tone={item.pinned ? "amber" : "slate"}>{item.pinned ? "상단 고정" : "일반"}</StatusPill>
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
            {liveNotices.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={5}>
                  등록된 공지가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager
          page={noticePage.page}
          pageCount={noticePage.pageCount}
          total={noticePage.total}
          pageSize={noticePage.pageSize}
          onPage={noticePage.setPage}
        />
      </Panel>

      {formMode ? (
        <NoticeFormModal
          mode={formMode}
          initial={formMode === "edit" ? editing : null}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {detail ? (
        <DetailModal title="공지사항 상세" onClose={() => setDetail(null)} wide>
          <DetailRows
            rows={[
              { label: "제목", value: detail.title },
              { label: "카테고리", value: detail.category },
              { label: "작성일", value: detail.createdAt },
              { label: "등록 방법", value: detail.publishMode === "예약" ? `예약 · ${detail.scheduledAt ?? "—"}` : "즉시" },
              { label: "노출", value: detail.visible ? "노출" : "비노출" },
              { label: "고정", value: detail.pinned ? "상단 고정" : "일반" },
              { label: "노출 종료", value: detail.endsAt ?? "제한 없음" },
            ]}
          />
          <div className="mt-4">
            <p className="text-xs font-medium text-slate-400">내용</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{detail.body}</p>
          </div>
          {detail.images.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400">첨부 사진</p>
              <ul className="mt-2 flex flex-wrap gap-3">
                {detail.images.map((image) => (
                  <li key={image.id} className="h-28 w-28 overflow-hidden rounded-xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={ghostButtonClass} onClick={() => setDetail(null)}>
              닫기
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
          title="공지사항 삭제"
          body="공지사항을 삭제하시겠습니까?"
          confirmLabel="삭제"
          cancelLabel="취소"
          onConfirm={confirmDelete}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
