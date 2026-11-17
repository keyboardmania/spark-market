"use client";

import { useRef } from "react";
import { useI18n } from "@/features/i18n/useI18n";

export function PhotoAttachButton({ onFiles }: { onFiles: (files: File[]) => void }) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-800 hover:border-slate-400 hover:bg-white"
      >
        <CameraIcon />
        {t("photoAttach")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="sr-only"
        onChange={(event) => {
          const files = event.target.files ? Array.from(event.target.files) : [];
          event.target.value = "";
          onFiles(files);
        }}
      />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" aria-hidden>
      <path d="M8 7.5 9.2 6h5.6L16 7.5h2.2A1.8 1.8 0 0 1 20 9.3v7.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 16.7V9.3a1.8 1.8 0 0 1 1.8-1.8H8Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
