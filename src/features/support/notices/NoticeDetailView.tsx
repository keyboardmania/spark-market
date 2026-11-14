"use client";

import { useShared } from "@/data/shared";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

export function NoticeDetailView({ id }: { id: string }) {
  const notices = useShared().notices.filter((item) => !item.deletedAt);
  const notice = notices.find((item) => item.id === id) ?? null;
  const pinned = notices[0]?.id === id;

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
        <p className="text-xs text-slate-400">{pinned ? "상단 고정" : "일반 노출"}</p>
        <p className="text-sm leading-7 text-slate-700">{notice.body}</p>
      </div>
    </WireframeFrame>
  );
}
