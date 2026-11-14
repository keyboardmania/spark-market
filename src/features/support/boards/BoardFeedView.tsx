"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { INQUIRY_TYPES, type InquiryType, type NoticeCategory } from "@/data/mockData";
import { useShared } from "@/data/shared";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";
import { submitInquiry, useInquiries, type InquiryPhoto } from "@/features/support/inquiries/inquiryStore";

const NOTICE_FILTERS = ["전체", "일반", "정책변경", "사기예방"] as const;
const INQUIRY_FILTERS = ["전체", "답변 완료", "접수 완료"] as const;

export function boardHref(id: string) {
  return `/support/boards/${id}`;
}

export function BoardFeedView({ id }: { id: string }) {
  const board = useShared().boards.find((item) => item.id === id) ?? null;

  if (!board || !board.used) {
    return (
      <WireframeFrame eyebrow="SUPPORT" title="게시판을 찾을 수 없어요" backHref="/support" backLabel="고객센터">
        <p className="text-sm text-slate-500">사용 중이 아니거나 목록에 없는 게시판입니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame eyebrow={board.category} title={board.name} lede={boardLede(board)} backHref="/support" backLabel="고객센터">
      {board.id === "board-notice" ? <NoticeList pinned={board.fixed} /> : null}
      {board.id === "board-faq" ? <FaqList /> : null}
      {board.id === "board-inquiry" ? <InquiryDesk /> : null}
      {board.id !== "board-notice" && board.id !== "board-faq" && board.id !== "board-inquiry" ? (
        <PostList boardId={board.id} pinned={board.fixed} />
      ) : null}
    </WireframeFrame>
  );
}

function boardLede(board: { userWrite: boolean; fixed: boolean }) {
  const write = board.userWrite ? "회원이 글을 남길 수 있어요." : "운영자가 올린 글만 보여요.";
  return board.fixed ? `${write} 상단 고정이 켜져 있어요.` : write;
}

function NoticeList({ pinned }: { pinned: boolean }) {
  const notices = useShared().notices.filter((item) => !item.deletedAt);
  const [filter, setFilter] = useState<NoticeCategory | "전체">("전체");
  const visible = notices.filter((item) => filter === "전체" || item.category === filter);

  return (
    <div id="notices" className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {NOTICE_FILTERS.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} className={chipClass(filter === item)}>
            {item}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {visible.map((item, index) => (
          <li key={item.id}>
            <Link href={`/support/notices/${item.id}`} className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-4 hover:bg-slate-50">
              <span className="text-xs text-slate-400">
                {pinned && index === 0 && filter === "전체" ? "고정 · " : ""}
                {item.category} · {item.createdAt}
              </span>
              <span className="text-sm font-medium text-slate-900">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqList() {
  const faqs = useShared().faqs.filter((item) => !item.deletedAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <ul id="faq" className="flex flex-col gap-2">
      {faqs.map((item) => (
        <li key={item.id}>
          <Link href={`/support/faq/${item.id}`} className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-4 hover:bg-slate-50">
            <span className="text-xs text-slate-400">{item.createdAt}</span>
            <span className="text-sm font-medium text-slate-900">{item.question}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function InquiryDesk() {
  const inquiries = useInquiries();
  const [filter, setFilter] = useState<(typeof INQUIRY_FILTERS)[number]>("전체");
  const [type, setType] = useState<InquiryType | "">("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<InquiryPhoto | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [done, setDone] = useState(false);
  const visible = useMemo(
    () => inquiries.filter((item) => filter === "전체" || item.status === filter),
    [filter, inquiries],
  );

  return (
    <div id="inquiry" className="flex flex-col gap-8">
      <form
        className="space-y-3 rounded-2xl border border-slate-200 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!type || body.trim().length < 1) return;
          submitInquiry({ type, body: body.trim(), photo });
          setType("");
          setBody("");
          setPhoto(null);
          setPhotoError("");
          setDone(true);
        }}
      >
        <label className="block space-y-2 text-xs text-slate-500">문의 유형
          <select value={type} onChange={(event) => setType(event.target.value as InquiryType | "")} className={fieldClass}>
            <option value="">선택해 주세요</option>
            {INQUIRY_TYPES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block space-y-2 text-xs text-slate-500">내용
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} className={fieldClass} />
        </label>
        <label className="flex flex-col gap-2 text-xs text-slate-500">사진 첨부 (최대 1장)
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => {
              const files = event.target.files;
              if (!files || files.length === 0) {
                setPhoto(null);
                setPhotoError("");
                return;
              }
              if (files.length > 1) {
                setPhoto(null);
                setPhotoError("사진은 1장만 첨부할 수 있어요.");
                event.target.value = "";
                return;
              }
              const file = files[0];
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  setPhoto({ name: file.name, url: reader.result });
                  setPhotoError("");
                }
              };
              reader.readAsDataURL(file);
            }}
            className="block text-sm"
          />
        </label>
        {photoError ? <p className="text-sm text-rose-600">{photoError}</p> : null}
        {photo?.url ? <img src={photo.url} alt={photo.name} className="h-24 w-24 rounded-xl object-cover" /> : null}
        <button type="submit" className={primaryButtonClass}>접수하기</button>
        {done ? <p className="text-sm text-slate-500">문의가 접수 완료되었습니다.</p> : null}
      </form>

      <section id="inquiries" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-900">문의 내역</h2>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_FILTERS.map((item) => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={chipClass(filter === item)}>
              {item}
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-2">
          {visible.map((item) => (
            <li key={item.id}>
              <Link href={`/support/inquiries/${item.id}`} className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-4 hover:bg-slate-50">
                <span className="text-xs text-slate-400">{item.status} · {item.type} · {item.createdAt}</span>
                <span className="line-clamp-1 text-sm text-slate-800">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PostList({ boardId, pinned }: { boardId: string; pinned: boolean }) {
  const posts = useShared().posts
    .filter((item) => item.boardId === boardId && !item.deletedAt)
    .sort((a, b) => Number(b.fixed) - Number(a.fixed) || b.createdAt.localeCompare(a.createdAt));

  if (posts.length === 0) {
    return <p className="text-sm text-slate-400">아직 글이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {posts.map((item) => (
        <li key={item.id}>
          <Link href={`/support/posts/${item.id}`} className="flex flex-col gap-1 rounded-2xl border border-slate-200 px-4 py-4 hover:bg-slate-50">
            <span className="text-xs text-slate-400">{pinned && item.fixed ? "고정 · " : ""}{item.createdAt}</span>
            <span className="text-sm font-medium text-slate-900">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-sm ${active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`;
}
