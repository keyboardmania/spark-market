"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { passwordIssue } from "@/components/spark/AuthScreens";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";

export function ForgotScreen() {
  const { requestResetCode, resetPassword } = useSpark();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const issue = password ? passwordIssue(password) : null;

  function sendCode() {
    setError(null);
    if (!requestResetCode(email.trim())) {
      setSent(false);
      setError("가입된 이메일을 확인해 주세요.");
      return;
    }
    setSent(true);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sent || issue) return;
    if (!resetPassword(email.trim(), code.trim(), password)) {
      setError("인증번호가 맞지 않거나 이메일 계정이 아니에요.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">비밀번호 찾기</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">가입 이메일로 인증번호를 보낸 뒤 새 비밀번호를 저장합니다. 테스트 번호는 5825입니다.</p>
      {done ? (
        <p className="mt-6 text-sm text-slate-700">
          비밀번호를 바꿨어요. <Link href="/login" className="font-medium text-slate-900">로그인</Link>
        </p>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">이메일</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
          </label>
          <button type="button" onClick={sendCode} className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
            인증번호 받기
          </button>
          {sent ? <p className="text-xs text-slate-500">인증번호를 보냈습니다.</p> : null}
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">인증번호</span>
            <input value={code} onChange={(event) => setCode(event.target.value)} className={fieldClass} />
          </label>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">새 비밀번호</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={fieldClass} />
            {issue ? <span className="block text-xs text-rose-600">{issue}</span> : null}
          </label>
          <button type="submit" disabled={!sent || Boolean(issue) || !password} className={`${primaryButtonClass} w-full`}>
            비밀번호 변경
          </button>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
