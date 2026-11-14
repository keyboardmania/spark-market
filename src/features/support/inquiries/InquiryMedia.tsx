import type { InquiryPhoto } from "@/features/support/inquiries/inquiryStore";

export function InquiryMedia({ photo }: { photo: InquiryPhoto | null }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs text-slate-400">첨부 이미지 · 최대 1장</figcaption>
      {photo?.url ? (
        <img src={photo.url} alt={photo.name} className="h-48 w-full rounded-2xl object-cover" />
      ) : (
        <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
          {photo?.name ? photo.name : "첨부된 이미지가 없어요."}
        </div>
      )}
    </figure>
  );
}
