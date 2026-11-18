"use client";

import { useShared } from "@/data/shared";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

export function NoticeDetailView({ id }: { id: string }) {
  const notice = useShared().notices.find((item) => item.id === id && !item.deletedAt && item.visible) ?? null;

  if (!notice) {
    return (
      <WireframeFrame eyebrow="NOTICE" title="공지를 찾을 수 없어요" backHref="/support/boards/board-notice" backLabel="공지사항">
        <p className="text-sm text-slate-500">삭제되었거나 목록에 없는 공지입니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame
      eyebrow="NOTICE"
      title={notice.title}
      lede={`${notice.category} · ${notice.createdAt}`}
      backHref="/support/boards/board-notice"
      backLabel="공지사항"
    >
      <div className="flex flex-col gap-6">
        <p className="text-xs text-slate-400">{notice.pinned ? "상단 고정" : "일반 노출"}</p>
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{notice.body}</p>
        {notice.images.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {notice.images.map((image) => (
              <li key={image.id} className="overflow-hidden rounded-2xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="max-h-72 w-auto max-w-full object-contain" />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </WireframeFrame>
  );
}
