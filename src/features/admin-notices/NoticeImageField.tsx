"use client";

import { useRef } from "react";
import type { NoticeImage } from "@/data/mockData";

const MAX_IMAGES = 5;

export function NoticeImageField({
  images,
  onChange,
}: {
  images: NoticeImage[];
  onChange: (images: NoticeImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_IMAGES - images.length;

  function handleFiles(fileList: FileList | null) {
    if (!fileList || remaining <= 0) return;
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remaining);
    if (files.length === 0) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<NoticeImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ id: crypto.randomUUID(), url: String(reader.result) });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((next) => onChange([...images, ...next]));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">사진 첨부</p>
        <p className="text-[11px] text-slate-400">
          최대 {MAX_IMAGES}장 · {images.length}/{MAX_IMAGES}
        </p>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-400">png, jpg, jpeg · 미리보기에서 개별 삭제</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,.png,.jpg,.jpeg"
        multiple
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <ul className="mt-3 flex flex-wrap gap-3">
        {images.map((image) => (
          <li key={image.id} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((item) => item.id !== image.id))}
              className="absolute right-1 top-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-white"
            >
              삭제
            </button>
          </li>
        ))}
        {remaining > 0 ? (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="grid h-24 w-24 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 hover:border-slate-400 hover:bg-white"
            >
              + 추가
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
