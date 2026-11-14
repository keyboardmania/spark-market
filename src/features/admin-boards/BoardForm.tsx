"use client";

import type { BoardDraft } from "@/features/admin-boards/model";
import { FieldLabel } from "@/features/wireframe/FieldLabel";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

const FLAGS: { key: keyof Pick<BoardDraft, "userWrite" | "media" | "fixed" | "reservation" | "used">; label: string }[] = [
  { key: "userWrite", label: "작성 권한" },
  { key: "media", label: "미디어 사용" },
  { key: "fixed", label: "상단 고정" },
  { key: "reservation", label: "예약 게시" },
  { key: "used", label: "사용" },
];

export function BoardForm({
  draft,
  selected,
  notice,
  onChange,
  onCreate,
  onUpdate,
  onDelete,
  onClear,
}: {
  draft: BoardDraft;
  selected: boolean;
  notice: string;
  onChange: (draft: BoardDraft) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  return (
    <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
      <FieldLabel label="게시판 카테고리">
        <input value={draft.category} onChange={(event) => onChange({ ...draft, category: event.target.value })} className={fieldClass} />
      </FieldLabel>
      <FieldLabel label="게시판 이름">
        <input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} className={fieldClass} />
      </FieldLabel>
      <fieldset className="flex flex-wrap gap-3">
        {FLAGS.map((flag) => (
          <label key={flag.key} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={draft[flag.key]}
              onChange={(event) => onChange({ ...draft, [flag.key]: event.target.checked })}
            />
            {flag.label}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ghostButtonClass} onClick={onClear}>새로 작성</button>
        <button type="button" className={primaryButtonClass} onClick={onCreate}>등록</button>
        <button type="button" className={ghostButtonClass} onClick={onUpdate} disabled={!selected}>수정</button>
        <button type="button" className={ghostButtonClass} onClick={onDelete} disabled={!selected}>삭제</button>
      </div>
      {notice ? <p className="text-sm text-slate-500">{notice}</p> : null}
    </form>
  );
}
