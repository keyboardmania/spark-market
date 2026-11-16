"use client";

import { useState, type ReactNode } from "react";
import { ADDRESS_LIMIT, ADDRESS_LIMIT_MESSAGE, type ShippingAddress } from "@/data/mockData";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useI18n } from "@/features/i18n/useI18n";
import { fill } from "@/features/i18n/ui";
import { QuickFill } from "@/features/wireframe/QuickFill";
import { QUICK_ADDRESS } from "@/features/wireframe/demoProfile";

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
  const { t } = useI18n();
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
    if (!next.name.trim()) found.name = t("addrNameNeed");
    if (!next.phone.trim()) found.phone = t("addrPhoneNeed");
    if (!next.address.trim()) found.address = t("addrAddressNeed");
    if (!next.detail.trim()) found.detail = t("addrDetailNeed");
    if (!next.postalCode.trim()) found.postalCode = t("addrPostalNeed");
    if (next.defaultChoice !== "O" && next.defaultChoice !== "X") {
      found.defaultChoice = t("addrDefaultNeed");
    } else if (editing?.isDefault && next.defaultChoice === "X") {
      found.defaultChoice = t("addrKeepDefault");
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
        notify(t("addrEdited"));
        closeForm();
      }
      return;
    }

    const result = addAddress(payload);
    if (result === "limit") {
      setLimitOpen(true);
      return;
    }
    notify(payload.isDefault && addresses.length > 0 ? t("addrCreatedDefault") : t("addrCreated"));
    closeForm();
  }

  function askRemove(item: ShippingAddress) {
    if (item.isDefault || removeAddress(item.id) === "keep-default") {
      setDefaultLockOpen(true);
      return;
    }
    notify(t("addrDeleted"));
  }

  return (
    <section id="addresses">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("addrTitle")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {fill(t("addrCount"), { count: `${addresses.length}/${ADDRESS_LIMIT}` })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickFill
            onFill={() => {
              if (!formOpen) {
                if (addresses.length >= ADDRESS_LIMIT) {
                  setLimitOpen(true);
                  return;
                }
                setEditingId(null);
                setFormOpen(true);
              }
              const only = !editingId && addresses.length === 0;
              setDraft({
                ...QUICK_ADDRESS,
                defaultChoice: only || lockDefault ? "O" : "X",
              });
              setErrors({});
            }}
          />
          <button type="button" onClick={openCreate} className={primaryButtonClass}>
            {t("addrAdd")}
          </button>
        </div>
      </div>

      {formOpen ? (
        <form
          className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <h3 className="text-base font-semibold text-slate-900">{editingId ? t("addrEditTitle") : t("addrNew")}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label={t("addrName")} error={errors.name}>
              <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label={t("addrPhone")} error={errors.phone}>
              <input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} inputMode="tel" className={fieldClass} aria-invalid={Boolean(errors.phone)} />
            </Field>
            <Field label={t("addrPostal")} error={errors.postalCode}>
              <input value={draft.postalCode} onChange={(event) => setDraft({ ...draft, postalCode: event.target.value })} inputMode="numeric" className={fieldClass} aria-invalid={Boolean(errors.postalCode)} />
            </Field>
            <Field label={t("addrDefaultSetting")} error={errors.defaultChoice}>
              <select
                value={lockDefault ? "O" : draft.defaultChoice}
                disabled={lockDefault}
                onChange={(event) => setDraft({ ...draft, defaultChoice: event.target.value as DefaultChoice })}
                className={fieldClass}
                aria-invalid={Boolean(errors.defaultChoice)}
              >
                <option value="">{t("addrChoose")}</option>
                <option value="O">O</option>
                <option value="X">X</option>
              </select>
            </Field>
            <Field label={t("addrAddress")} error={errors.address} wide>
              <input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.address)} />
            </Field>
            <Field label={t("addrDetail")} error={errors.detail} wide>
              <input value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} className={fieldClass} aria-invalid={Boolean(errors.detail)} />
            </Field>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            {lockDefault ? t("addrLock") : t("addrDefaultRule")}
          </p>
          <div className="mt-4 flex gap-2">
            <button type="submit" className={primaryButtonClass}>{editingId ? t("addrSave") : t("addrCreate")}</button>
            <button type="button" onClick={closeForm} className={ghostButtonClass}>{t("cancel")}</button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-8 text-sm text-slate-400">{t("addrEmpty")}</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {addresses.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {item.isDefault ? (
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">{t("addrDefault")}</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">{t("addrNotDefault")}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    ({item.postalCode}) {item.address} {item.detail}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.isDefault ? null : (
                    <button type="button" onClick={() => { setDefaultAddress(item.id); notify(t("addrChanged")); }} className={ghostButtonClass}>
                      {t("addrMakeDefault")}
                    </button>
                  )}
                  <button type="button" onClick={() => openEdit(item)} className={ghostButtonClass}>{t("addrEdit")}</button>
                  <button type="button" onClick={() => askRemove(item)} className={ghostButtonClass}>{t("addrDelete")}</button>
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
