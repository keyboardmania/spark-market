"use client";

import { useShared } from "@/data/shared";
import { boardHref } from "@/features/support/boards/BoardFeedView";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

export function PostDetailView({ id }: { id: string }) {
  const shared = useShared();
  const post = shared.posts.find((item) => item.id === id && !item.deletedAt) ?? null;
  const board = post ? shared.boards.find((item) => item.id === post.boardId) ?? null : null;

  if (!post || !board || !board.used) {
    return (
      <WireframeFrame eyebrow="SUPPORT" title="글을 찾을 수 없어요" backHref="/support" backLabel="고객센터">
        <p className="text-sm text-slate-500">삭제되었거나 사용 중이 아닌 게시판의 글입니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame
      eyebrow={board.name}
      title={post.title}
      lede={post.createdAt}
      backHref={boardHref(board.id)}
      backLabel={board.name}
    >
      <div className="flex flex-col gap-6">
        {board.fixed && post.fixed ? <p className="text-xs text-slate-400">상단 고정</p> : null}
        <p className="text-sm leading-7 text-slate-700">{post.body}</p>
      </div>
    </WireframeFrame>
  );
}
