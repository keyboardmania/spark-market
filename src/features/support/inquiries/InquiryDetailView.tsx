"use client";

import { InquiryMedia } from "@/features/support/inquiries/InquiryMedia";
import { inquiryById, useInquiries } from "@/features/support/inquiries/inquiryStore";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

export function InquiryDetailView({ id }: { id: string }) {
  useInquiries();
  const inquiry = inquiryById(id);

  if (!inquiry) {
    return (
      <WireframeFrame eyebrow="SUPPORT" title="문의를 찾을 수 없어요" backHref="/support/boards/board-inquiry" backLabel="문의 내역">
        <p className="text-sm text-slate-500">목록에 없는 문의 번호입니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame
      eyebrow="SUPPORT"
      title={inquiry.type}
      lede={`${inquiry.status} · ${inquiry.createdAt}`}
      backHref="/support/boards/board-inquiry"
      backLabel="문의 내역"
    >
      <div className="flex flex-col gap-6">
        <InquiryMedia photo={inquiry.photo} />
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-slate-900">문의 내용</h2>
          <p className="text-sm leading-6 text-slate-700">{inquiry.body}</p>
        </section>
        <section className="flex flex-col gap-2 rounded-2xl bg-slate-50 px-4 py-4">
          <h2 className="text-sm font-medium text-slate-900">답변</h2>
          <p className="text-sm leading-6 text-slate-600">{inquiry.reply || "아직 답변이 없어요."}</p>
        </section>
      </div>
    </WireframeFrame>
  );
}
