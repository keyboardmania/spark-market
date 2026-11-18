"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { PasswordField } from "@/components/spark/admin/PasswordField";
import { ADMIN_DEMO } from "@/data/mockData";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

const STEPS = ["현재 비밀번호", "이메일 인증", "새 비밀번호"] as const;
type Step = "current" | "verify" | "next";

export function AdminPassword() {
  const router = useRouter();
  const alive = useRef(true);
  const { session, requestAdminResetCode, confirmAdminPassword, changeAdminPassword } = useAdmin();
  const [step, setStep] = useState<Step>("current");
  const [current, setCurrent] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  if (!session) {
    return <p className="text-sm text-slate-500">세션을 확인하고 있어요.</p>;
  }

  async function wait() {
    setPending(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    if (!alive.current) return false;
    setPending(false);
    return true;
  }

  async function onConfirmCurrent(event: FormEvent) {
    event.preventDefault();
    if (!current) {
      setError("현재 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    if (!(await wait())) return;
    if (!confirmAdminPassword(current)) {
      setError("현재 비밀번호가 맞지 않아요.");
      return;
    }
    setStep("verify");
  }

  async function onSendCode() {
    setError("");
    if (!(await wait())) return;
    if (!requestAdminResetCode()) {
      setError("인증번호를 보내지 못했어요.");
      return;
    }
    setSent(true);
  }

  async function onConfirmCode(event: FormEvent) {
    event.preventDefault();
    if (!sent) {
      setError("먼저 인증번호를 받아 주세요.");
      return;
    }
    setError("");
    if (!(await wait())) return;
    if (code.trim() !== ADMIN_DEMO.verifyCode) {
      setError("인증번호가 맞지 않아요.");
      return;
    }
    setStep("next");
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    if (!next.trim()) {
      setError("새 비밀번호를 입력해 주세요.");
      return;
    }
    if (next !== confirm) {
      setError("비밀번호 확인이 일치하지 않아요.");
      return;
    }
    if (next === current) {
      setError("현재 비밀번호와 다른 비밀번호를 입력해 주세요.");
      return;
    }
    setError("");
    if (!(await wait())) return;
    const result = changeAdminPassword(current, code.trim(), next);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/admin");
  }

  const stepIndex = step === "current" ? 0 : step === "verify" ? 1 : 2;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">대시보드 홈</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">비밀번호 변경</h1>
        <p className="mt-2 text-sm text-slate-500">현재 비밀번호 확인 → 이메일 인증 → 새 비밀번호 저장 후 대시보드 홈으로 돌아갑니다.</p>
      </div>
      <ol className="flex flex-wrap gap-2" aria-label="비밀번호 변경 단계">
        {STEPS.map((label, index) => (
          <li key={label} className={`rounded-full px-3 py-1.5 text-xs ${index === stepIndex ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      {step === "current" ? (
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onConfirmCurrent} aria-busy={pending}>
          <PasswordField id="admin-current-password" label="현재 비밀번호" value={current} onChange={setCurrent} autoComplete="current-password" />
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" className={primaryButtonClass} disabled={pending}>다음</button>
        </form>
      ) : null}
      {step === "verify" ? (
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onConfirmCode} aria-busy={pending}>
          <p className="text-sm text-slate-600">{session.email}로 인증번호를 받습니다.</p>
          <div className="flex justify-end">
            <button type="button" className={ghostButtonClass} onClick={() => void onSendCode()} disabled={pending}>
              {sent ? "인증번호 다시 받기" : "인증번호 받기"}
            </button>
          </div>
          <label className="block space-y-2 text-sm">
            <span className="text-xs font-medium text-slate-500">인증번호</span>
            <input value={code} onChange={(event) => setCode(event.target.value)} className={fieldClass} placeholder="6자리 코드" disabled={!sent} />
          </label>
          {sent ? <p className="text-xs text-slate-400">데모 코드는 {ADMIN_DEMO.verifyCode} 입니다.</p> : null}
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" className={primaryButtonClass} disabled={pending || !sent}>다음</button>
        </form>
      ) : null}
      {step === "next" ? (
        <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onChangePassword} aria-busy={pending}>
          <PasswordField id="admin-next-password" label="새 비밀번호" value={next} onChange={setNext} autoComplete="new-password" />
          <PasswordField id="admin-next-password-confirm" label="새 비밀번호 확인" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={Boolean(confirm) && confirm !== next} />
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <button type="submit" className={primaryButtonClass} disabled={pending}>비밀번호 저장</button>
        </form>
      ) : null}
    </div>
  );
}
