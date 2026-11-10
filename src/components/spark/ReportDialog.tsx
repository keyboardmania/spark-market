"use client";

import { useState } from "react";
import { submitReport, type LiveReport } from "@/data/shared";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";

const LABELS: Record<LiveReport["targetType"], string> = {
  상품: "상품 신고",
  유저: "유저 신고",
  회원: "유저 신고",
  채팅: "유저 신고",
  리뷰: "리뷰 신고",
};

export function ReportButton({
  targetType,
  targetId,
  targetLabel,
}: {
  targetType: LiveReport["targetType"];
  targetId: string;
  targetLabel: string;
}) {
  const { notify, user } = useSpark();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState(0);

  function close() {
    setOpen(false);
    setBody("");
    setPhotos(0);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-slate-500 underline-offset-4 hover:underline">
        신고
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center" onClick={close}>
          <form
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              if (!body.trim()) return;
              submitReport({
                targetType,
                targetId,
                targetLabel,
                body: body.trim(),
                photoCount: photos,
                reporter: user?.name ?? "비회원",
              });
              notify("신고가 접수되었습니다. 접수 후에는 수정하거나 조회할 수 없어요.");
              close();
            }}
          >
            <h2 id="report-title" className="text-lg font-semibold text-slate-900">{LABELS[targetType]}</h2>
            <p className="mt-1 text-sm text-slate-600">{targetLabel}</p>
            <label className="mt-4 block space-y-2">
              <span className="text-xs text-slate-500">내용</span>
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} className={fieldClass} />
            </label>
            <label className="mt-3 block space-y-2">
              <span className="text-xs text-slate-500">사진 최대 5장</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={(event) => setPhotos(Math.min(5, event.target.files?.length ?? 0))}
              />
              {photos > 0 ? <span className="block text-xs text-slate-400">{photos}장 선택</span> : null}
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={close} className={ghostButtonClass}>닫기</button>
              <button type="submit" disabled={!body.trim()} className={primaryButtonClass}>접수</button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
