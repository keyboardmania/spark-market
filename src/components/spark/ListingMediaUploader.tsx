"use client";

import { useRef, useState } from "react";
import type { ProductMedia } from "@/data/mockData";

const MAX_MEDIA = 10;

export function ListingMediaUploader({
  media,
  error,
  disabled = false,
  onFiles,
  onRemove,
  onReorder,
}: {
  media: ProductMedia[];
  error?: string;
  disabled?: boolean;
  onFiles: (files: FileList | null) => void;
  onRemove: (id: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const draggingId = useRef<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  let photoNumber = 0;

  function clearDrag() {
    draggingId.current = null;
    setActiveId(null);
    setOverId(null);
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-500">사진 / 동영상</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">사진첩에서만 선택 · 최소 1개, 최대 10개 · 사진(png, jpg, jpeg), 동영상(mp4, mov)</p>
      <p className="mt-1 text-xs leading-5 text-slate-400">
        사진을 끌어 1번 자리에 놓으면 그 사진이 대표 이미지가 되고 나머지 순서가 다시 매겨집니다. 동영상은 대표와 AI 분석에서 빠집니다.
      </p>
      <div className={`mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 ${disabled ? "opacity-60" : ""}`}>
        <input
          ref={fileRef}
          type="file"
          multiple
          disabled={disabled}
          accept=".png,.jpg,.jpeg,.mp4,.mov,image/png,image/jpeg,video/mp4,video/quicktime"
          className="sr-only"
          onChange={(event) => {
            if (disabled) return;
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {media.length === 0 ? (
          <div className="grid h-24 w-24 place-items-center rounded-xl bg-white text-xs text-slate-400">미리보기</div>
        ) : (
          <ul className="flex flex-wrap gap-3" aria-label="첨부한 사진 순서">
            {media.map((item) => {
              const number = item.kind === "image" ? ++photoNumber : null;
              const dragging = activeId === item.id;
              const coverTarget = Boolean(activeId && activeId !== item.id && item.thumbnailed && overId === item.id);
              const shiftTarget = Boolean(activeId && activeId !== item.id && !item.thumbnailed && overId === item.id);
              return (
                <li key={item.id} className="relative w-24">
                  <div
                    draggable={!disabled && item.kind === "image"}
                    onDragStart={(event) => {
                      if (disabled || item.kind !== "image") {
                        event.preventDefault();
                        return;
                      }
                      draggingId.current = item.id;
                      setActiveId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragEnd={clearDrag}
                    onDragOver={(event) => {
                      if (disabled || !draggingId.current || draggingId.current === item.id) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                      setOverId(item.id);
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (disabled) {
                        clearDrag();
                        return;
                      }
                      const sourceId = event.dataTransfer.getData("text/plain") || draggingId.current;
                      const targetId = item.id;
                      clearDrag();
                      if (!sourceId || sourceId === targetId) return;
                      onReorder(sourceId, targetId);
                    }}
                    className={`relative rounded-xl ${!disabled && item.kind === "image" ? "cursor-grab active:cursor-grabbing" : ""} ${item.thumbnailed ? "ring-2 ring-rose-500 ring-offset-2" : ""} ${coverTarget ? "ring-rose-600 ring-offset-4" : ""} ${shiftTarget ? "ring-2 ring-slate-900 ring-offset-2" : ""} ${dragging ? "opacity-40" : ""}`}
                  >
                    {item.kind === "video" ? (
                      <video src={item.url} className="pointer-events-none h-24 w-24 rounded-xl bg-slate-900 object-cover" muted />
                    ) : (
                      <img src={item.url} alt={item.name} draggable={false} className="pointer-events-none h-24 w-24 rounded-xl object-cover" />
                    )}
                    <span
                      className={`pointer-events-none absolute left-1 top-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white ${item.thumbnailed ? "bg-rose-600" : "bg-slate-900/90"}`}
                    >
                      {number ?? "동영상"}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(item.id)}
                    className="absolute -right-1 -top-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-xs text-slate-500 shadow disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`${item.name} 삭제`}
                  >
                    ×
                  </button>
                  <p className="mt-1 truncate text-center text-[10px] text-slate-400" title={item.name}>
                    {coverTarget ? "1번으로 놓기" : item.thumbnailed ? "대표 이미지" : number ? `${number}번` : "동영상"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:text-slate-300">
            사진첩에서 선택
          </button>
          <span className="text-xs text-slate-400">{media.length}/{MAX_MEDIA}</span>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
