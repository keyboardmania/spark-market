import { PHOTO_ATTACHMENT_LIMIT, type InquiryPhoto } from "@/features/support/inquiries/inquiryStore";

export function InquiryMedia({ photos }: { photos: InquiryPhoto[] }) {
  const visible = photos.slice(0, PHOTO_ATTACHMENT_LIMIT);
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs text-slate-400">첨부 이미지 · 최대 {PHOTO_ATTACHMENT_LIMIT}장</figcaption>
      {visible.length === 0 ? (
        <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400">
          첨부된 이미지가 없어요.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {visible.map((photo) => (
            <li key={`${photo.name}-${photo.url.slice(0, 24)}`}>
              {photo.url ? (
                <img src={photo.url} alt={photo.name} className="h-32 w-full rounded-2xl object-cover" />
              ) : (
                <div className="grid h-32 place-items-center rounded-2xl border border-dashed border-slate-200 px-3 text-center text-xs text-slate-400">
                  {photo.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
