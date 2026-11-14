"use client";

import { ALARM_TYPES, type AlarmDraft } from "@/features/admin-alarms/model";
import { FieldLabel } from "@/features/wireframe/FieldLabel";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export function AlarmForm({
  draft,
  selected,
  notice,
  onChange,
  onCreate,
  onUpdate,
  onDelete,
  onClear,
}: {
  draft: AlarmDraft;
  selected: boolean;
  notice: string;
  onChange: (draft: AlarmDraft) => void;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (selected) onUpdate();
        else onCreate();
      }}
    >
      <FieldLabel label="알림 종류">
        <select
          value={draft.type}
          onChange={(event) => onChange({ ...draft, type: event.target.value as AlarmDraft["type"] })}
          className={fieldClass}
        >
          {ALARM_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </FieldLabel>
      <FieldLabel label="제목">
        <input value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} className={fieldClass} />
      </FieldLabel>
      <FieldLabel label="내용">
        <textarea value={draft.body} onChange={(event) => onChange({ ...draft, body: event.target.value })} rows={4} className={fieldClass} />
      </FieldLabel>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ghostButtonClass} onClick={onClear}>
          새로 작성
        </button>
        <button type="button" className={primaryButtonClass} onClick={onCreate}>
          등록
        </button>
        <button type="button" className={ghostButtonClass} onClick={onUpdate} disabled={!selected}>
          수정
        </button>
        <button type="button" className={ghostButtonClass} onClick={onDelete} disabled={!selected}>
          삭제
        </button>
      </div>
      {notice ? <p className="text-sm text-slate-500">{notice}</p> : null}
    </form>
  );
}
