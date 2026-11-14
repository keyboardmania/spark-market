"use client";

import { useShared } from "@/data/shared";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

const FAQ_CATEGORIES = ["회원/계정", "거래 분쟁 운영정책", "안전결제"] as const;

export function FaqDetailView({ id }: { id: string }) {
  const faqs = useShared().faqs.filter((item) => !item.deletedAt);
  const index = faqs.findIndex((item) => item.id === id);
  const faq = index >= 0 ? faqs[index] : null;

  if (!faq) {
    return (
      <WireframeFrame eyebrow="FAQ" title="질문을 찾을 수 없어요" backHref="/support/boards/board-faq" backLabel="자주 묻는 질문">
        <p className="text-sm text-slate-500">삭제되었거나 목록에 없는 질문입니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame eyebrow="FAQ" title={faq.question} backHref="/support/boards/board-faq" backLabel="자주 묻는 질문">
      <div className="flex flex-col gap-6">
        <p className="text-xs text-slate-400">카테고리 · {FAQ_CATEGORIES[index % FAQ_CATEGORIES.length]}</p>
        <p className="text-sm leading-7 text-slate-700">{faq.answer}</p>
      </div>
    </WireframeFrame>
  );
}
