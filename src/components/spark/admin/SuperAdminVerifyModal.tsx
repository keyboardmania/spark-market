"use client";

import { useEffect, useRef, useState } from "react";
import { ADMIN_DEMO } from "@/data/mockData";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export function SuperAdminVerifyModal({
  title,
  description,
  expectedEmail,
  confirmLabel = "확인",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  expectedEmail: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(expectedEmail);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function sendCode() {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("슈퍼 관리자 이메일을 입력해 주세요.");
      return;
    }
    if (normalized !== expectedEmail.trim().toLowerCase()) {
      setError("슈퍼 관리자 이메일이 올바르지 않아요.");
      return;
    }
    setCodeSent(true);
    setError("");
    setNotice(`인증 코드를 ${normalized}로 보냈어요. 데모 코드는 ${ADMIN_DEMO.verifyCode} 입니다.`);
  }

  function submit() {
    if (!codeSent) {
      setError("먼저 인증 코드를 발송해 주세요.");
      return;
    }
    if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) {
      setError("슈퍼 관리자 이메일이 올바르지 않아요.");
      return;
    }
    if (code.trim() !== ADMIN_DEMO.verifyCode) {
      setError("인증 코드가 올바르지 않아요.");
      return;
    }
    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 px-4 py-6 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="super-admin-verify-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="super-admin-verify-title" className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className="block space-y-2 text-sm">
            <span className="text-xs font-medium text-slate-500">슈퍼 관리자 이메일</span>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
              placeholder="admin@spark.market"
            />
          </label>
          <div className="flex justify-end">
            <button type="button" className={ghostButtonClass} onClick={sendCode}>
              인증코드 발송
            </button>
          </div>
          <label className="block space-y-2 text-sm">
            <span className="text-xs font-medium text-slate-500">인증코드</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className={fieldClass}
              placeholder="6자리 코드"
              disabled={!codeSent}
            />
          </label>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          {notice ? <p className="text-sm text-slate-500">{notice}</p> : null}
          <div className="flex gap-2 pt-1">
            <button type="button" className={`${ghostButtonClass} flex-1`} onClick={onClose}>
              취소
            </button>
            <button type="submit" className={`${primaryButtonClass} flex-1`}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
