"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { PasswordField } from "@/components/spark/admin/PasswordField";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export const OPERATOR_CREATE_NOTICE_KEY = "spark-admin-operator-notice";

export function OperatorCreate() {
  const router = useRouter();
  const { session, createAdmin } = useAdmin();
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  if (session && session.role !== "슈퍼 관리자") {
    return (
      <div className="space-y-4">
        <Link href="/admin/operators" className="text-sm text-slate-500 hover:text-slate-900">운영자 계정 관리</Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">운영자 등록</h1>
        <p className="text-sm text-slate-500">슈퍼 관리자만 새 운영자를 등록할 수 있어요.</p>
        <Link href="/admin/operators" className={ghostButtonClass}>목록으로 돌아가기</Link>
      </div>
    );
  }

  const mismatch = Boolean(passwordConfirm) && passwordConfirm !== password;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const id = loginId.trim();
    const mail = email.trim();
    if (!id || !mail || !password.trim() || !passwordConfirm.trim()) {
      setError("아이디, 이메일, 비밀번호, 비밀번호 확인을 모두 입력해 주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않아요.");
      return;
    }
    const result = createAdmin({ loginId: id, email: mail, password, role: "관리자" });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    try {
      window.sessionStorage.setItem(OPERATOR_CREATE_NOTICE_KEY, `${id} 운영자 계정을 등록했어요.`);
    } catch {
      /* ignore */
    }
    router.push("/admin/operators");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/admin/operators" className="text-sm text-slate-500 hover:text-slate-900">← 운영자 계정 관리</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">운영자 등록</h1>
        <p className="mt-2 text-sm text-slate-500">생성할 관리자 계정 정보를 입력한 뒤 등록하세요.</p>
      </div>
      <form className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5" onSubmit={onSubmit}>
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">생성할 관리자 아이디</span>
          <input
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            className={fieldClass}
            placeholder="login id"
            autoComplete="off"
            required
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">생성할 관리자 이메일</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            className={fieldClass}
            placeholder="ops@spark.market"
            autoComplete="off"
            required
          />
        </label>
        <PasswordField
          id="operator-password"
          label="생성할 관리자 비밀번호"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          id="operator-password-confirm"
          label="생성할 관리자 비밀번호 확인"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          autoComplete="new-password"
          invalid={mismatch}
        />
        {mismatch ? <p role="alert" className="text-sm text-rose-600">비밀번호 확인이 일치하지 않아요.</p> : null}
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex gap-2 pt-1">
          <Link href="/admin/operators" className={`${ghostButtonClass} flex-1 text-center`}>취소</Link>
          <button type="submit" className={`${primaryButtonClass} flex-1`} disabled={mismatch}>
            계정 생성
          </button>
        </div>
      </form>
      <p className="text-center text-sm">
        <Link href="/admin/operators" className="text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline">
          목록으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
