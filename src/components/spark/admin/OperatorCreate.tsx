"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { ADMIN_DEMO, type AdminRole } from "@/data/mockData";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";

export function OperatorCreate() {
  const router = useRouter();
  const { session, createAdmin } = useAdmin();
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("관리자");
  const [codeSent, setCodeSent] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (session && session.role !== "슈퍼 관리자") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">운영자 등록</h1>
        <p className="text-sm text-slate-500">슈퍼 관리자만 새 운영자를 등록할 수 있어요.</p>
        <Link href="/admin/operators" className={ghostButtonClass}>목록으로</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/admin/operators" className="text-sm text-slate-500 hover:text-slate-900">운영자 계정 관리</Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">운영자 등록</h1>
        <p className="mt-2 text-sm text-slate-500">이메일 인증 후 슈퍼 관리자 확인으로 계정이 생성됩니다.</p>
      </div>
      <form
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!codeSent) {
            setError("먼저 이메일 인증 코드를 발송해 주세요.");
            return;
          }
          const result = createAdmin({ loginId, email, password, role, verifyCode });
          if (!result.ok) {
            setError(result.message);
            return;
          }
          setNotice("운영자 계정을 생성했어요.");
          router.push("/admin/operators");
        }}
      >
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">관리자 아이디</span>
          <input value={loginId} onChange={(event) => setLoginId(event.target.value)} className={fieldClass} placeholder="login id" />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">이메일</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className={fieldClass} placeholder="ops@spark.market" />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">임시 비밀번호</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className={fieldClass} />
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-xs font-medium text-slate-500">권한</span>
          <select value={role} onChange={(event) => setRole(event.target.value as AdminRole)} className={fieldClass}>
            <option value="관리자">관리자</option>
            <option value="슈퍼 관리자">슈퍼 관리자</option>
          </select>
        </label>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">이메일 인증</p>
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => {
                if (!email.trim()) {
                  setError("이메일을 먼저 입력해 주세요.");
                  return;
                }
                setCodeSent(true);
                setError("");
                setNotice(`인증 코드를 ${email.trim()}로 보냈어요. 데모 코드는 ${ADMIN_DEMO.verifyCode} 입니다.`);
              }}
            >
              인증 코드 발송
            </button>
          </div>
          <label className="mt-3 block space-y-2 text-sm">
            <span className="text-xs font-medium text-slate-500">인증 코드</span>
            <input value={verifyCode} onChange={(event) => setVerifyCode(event.target.value)} className={fieldClass} placeholder="6자리 코드" disabled={!codeSent} />
          </label>
        </div>
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        {notice ? <p className="text-sm text-slate-500">{notice}</p> : null}
        <div className="flex gap-2">
          <Link href="/admin/operators" className={`${ghostButtonClass} flex-1 text-center`}>취소</Link>
          <button type="submit" className={`${primaryButtonClass} flex-1`}>계정 생성</button>
        </div>
      </form>
    </div>
  );
}
