"use client";

import { useState, type ReactNode } from "react";
import { ADDRESS_LIMIT, ADDRESS_LIMIT_MESSAGE, type ShippingAddress } from "@/data/mockData";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

type DefaultChoice = "" | "O" | "X";

type Draft = {
  name: string;
  phone: string;
  address: string;
  detail: string;
  postalCode: string;
  defaultChoice: DefaultChoice;
};

type FieldKey = keyof Draft;

const EMPTY: Draft = {
  name: "",
  phone: "",
  address: "",
  detail: "",
  postalCode: "",
  defaultChoice: "",
};

export function AddressBook() {
  const { addresses, addAddress, updateAddress, removeAddress, setDefaultAddress, notify } = useSpark();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [limitOpen, setLimitOpen] = useState(false);
  const [defaultLockOpen, setDefaultLockOpen] = useState(false);

  const editing = addresses.find((item) => item.id === editingId) ?? null;
  const lockDefault = (editingId === null && addresses.length === 0) || Boolean(editing?.isDefault && addresses.length === 1);

  function openCreate() {
    if (addresses.length >= ADDRESS_LIMIT) {
      setLimitOpen(true);
      return;
    }
    setEditingId(null);
    setDraft(addresses.length === 0 ? { ...EMPTY, defaultChoice: "O" } : EMPTY);
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(item: ShippingAddress) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      phone: item.phone,
      address: item.address,
      detail: item.detail,
      postalCode: item.postalCode,
      defaultChoice: item.isDefault ? "O" : "X",
    });
    setErrors({});
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY);
    setErrors({});
  }

  function validate(next: Draft) {
    const found: Partial<Record<FieldKey, string>> = {};
    if (!next.name.trim()) found.name = "이름을 입력해 주세요.";
    if (!next.phone.trim()) found.phone = "전화번호를 입력해 주세요.";
    if (!next.address.trim()) found.address = "주소를 입력해 주세요.";
    if (!next.detail.trim()) found.detail = "상세주소를 입력해 주세요.";
    if (!next.postalCode.trim()) found.postalCode = "우편번호를 입력해 주세요.";
    if (next.defaultChoice !== "O" && next.defaultChoice !== "X") {
      found.defaultChoice = "기본 배송지 설정(O/X)을 선택해 주세요.";
    } else if (editing?.isDefault && next.defaultChoice === "X") {
      found.defaultChoice = "다른 주소를 먼저 기본 배송지로 변경해 주세요.";
    }
    return found;
  }

  function submit() {
    const next = lockDefault ? { ...draft, defaultChoice: "O" as const } : draft;
    const found = validate(next);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = {
      name: next.name,
      phone: next.phone,
      address: next.address,
      detail: next.detail,
      postalCode: next.postalCode,
      isDefault: next.defaultChoice === "O",
    };

    if (editingId) {
      const result = updateAddress(editingId, payload);
      if (result === "keep-default") {
        setDefaultLockOpen(true);
        return;
      }
      if (result === "ok") {
        notify("배송지를 수정했어요.");
        closeForm();
      }
      return;
    }

    const result = addAddress(payload);
    if (result === "limit") {
      setLimitOpen(true);
      return;
    }
    notify(payload.isDefault && addresses.length > 0 ? "기본 배송지로 등록했어요." : "배송지를 등록했어요.");
    closeForm();
  }

  function askRemove(item: ShippingAddress) {
    if (item.isDefault || removeAddress(item.id) === "keep-default") {
      setDefaultLockOpen(true);
      return;
    }
    notify("배송지를 삭제했어요.");
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">배송지 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            이름, 전화번호, 주소, 상세주소, 우편번호, 기본 배송지(O/X)는 모두 필수예요. {addresses.length}/{ADDRESS_LIMIT}개
          </p>
        </div>
        <button type="button" onClick={openCreate} className={primaryButtonClass}>
          배송지 추가
        </button>
      </div>

      {formOpen ? (
        <form
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">{editingId ? "배송지 수정" : "새 배송지"}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="이름" error={errors.name}>
              <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label="전화번호" error={errors.phone}>
              <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} inputMode="tel" className={fieldClass} aria-invalid={Boolean(errors.phone)} />
            </Field>
            <Field label="우편번호" error={errors.postalCode}>
              <input value={draft.postalCode} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} inputMode="numeric" className={fieldClass} aria-invalid={Boolean(errors.postalCode)} />
            </Field>
            <Field label="기본 배송지 설정" error={errors.defaultChoice}>
              <select
                value={lockDefault ? "O" : draft.defaultChoice}
                disabled={lockDefault}
                onChange={(event) => setDraft({ ...draft, defaultChoice: event.target.value as DefaultChoice })}
                className={fieldClass}
                aria-invalid={Boolean(errors.defaultChoice)}
              >
                <option value="">선택해 주세요</option>
                <option value="O">O</option>
                <option value="X">X</option>
              </select>
            </Field>
            <Field label="주소" error={errors.address} wide>
              <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.address)} />
            </Field>
            <Field label="상세주소" error={errors.detail} wide>
              <input value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.detail)} />
            </Field>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            {lockDefault
              ? "첫 배송지이거나 남은 주소가 하나뿐이면 자동으로 기본 배송지가 됩니다."
              : "기본 배송지는 항상 1개입니다. 기본 배송지는 다른 주소를 기본으로 바꾼 뒤에만 삭제할 수 있어요."}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="submit" className={primaryButtonClass}>{editingId ? "저장" : "등록"}</button>
            <button type="button" onClick={closeForm} className={ghostButtonClass}>취소</button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-400">등록된 배송지가 없어요.</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {addresses.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.isDefault ? (
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">기본 배송지</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">기본 배송지 아님</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    ({item.postalCode}) {item.address} {item.detail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.isDefault ? null : (
                    <button type="button" onClick={() => { setDefaultAddress(item.id); notify("기본 배송지를 변경했어요."); }} className={ghostButtonClass}>
                      기본 배송지로 변경
                    </button>
                  )}
                  <button type="button" onClick={() => openEdit(item)} className={ghostButtonClass}>수정</button>
                  <button type="button" onClick={() => askRemove(item)} className={ghostButtonClass}>삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {limitOpen ? (
        <NoticeDialog title="배송지 등록 한도" message={ADDRESS_LIMIT_MESSAGE} onClose={() => setLimitOpen(false)} />
      ) : null}
      {defaultLockOpen ? (
        <NoticeDialog
          title="기본 배송지는 삭제할 수 없어요"
          message="기본 배송지는 항상 1개가 있어야 합니다. 다른 주소를 먼저 기본 배송지로 변경한 뒤 삭제해 주세요."
          onClose={() => setDefaultLockOpen(false)}
        />
      ) : null}
    </section>
  );
}

function Field({
  label,
  error,
  wide = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`block text-xs font-medium text-slate-500 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="mt-1.5">{children}</div>
      {error ? <p role="alert" className="mt-1.5 text-xs font-normal text-rose-600">{error}</p> : null}
    </label>
  );
}

function NoticeDialog({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/30 px-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="address-notice-title"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="address-notice-title" className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <button type="button" onClick={onClose} className={`${primaryButtonClass} mt-5 w-full`}>확인</button>
      </div>
    </div>
  );
}
