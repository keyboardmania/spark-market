"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMounted } from "@/components/spark/useMounted";
import { ADMIN_ACCOUNTS, ADMIN_DEMO } from "@/data/mockData";
import { useAdmin, type AdminLoginFailure } from "@/components/spark/AdminProvider";
import { PasswordField } from "@/components/spark/admin/PasswordField";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";

export function AdminLogin() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, ready, session } = useAdmin();
  const mounted = useMounted();
  const [loginId, setLoginId] = useState<string>(ADMIN_DEMO.loginId);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AdminLoginFailure | null>(null);

  useEffect(() => {
    if (!mounted || !ready || !session || pathname !== "/admin/login") return;
    router.replace("/admin");
  }, [mounted, ready, session, pathname, router]);

  function submit() {
    const result = login(loginId, password);
    if (!result.ok) {
      setError(result);
      return;
    }
    setError(null);
    router.replace("/admin");
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50/50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-8">
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">SPARK ADMIN</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight text-slate-900">Spark</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">운영, 정산, 신고를 다루는 관리자 콘솔이에요.</p>

        <form
          className="mt-6 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <label className="block text-xs font-medium text-slate-500" htmlFor="admin-login-id">
            아이디
          </label>
          <input
            id="admin-login-id"
            type="text"
            autoComplete="username"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            aria-invalid={error?.field === "loginId"}
            className={fieldClass}
          />
          <PasswordField
            id="admin-password"
            label="비밀번호"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            invalid={error?.field === "password"}
          />
          {error ? (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error.message}
            </p>
          ) : null}
          <button type="submit" className={`${primaryButtonClass} w-full`}>
            관리자 로그인
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <p>데모 비밀번호는 {ADMIN_DEMO.password} 입니다. 로그인은 아이디로 합니다.</p>
          <ul className="mt-2 space-y-1">
            {ADMIN_ACCOUNTS.map((account) => (
              <li key={account.id}>
                {account.role} · {account.loginId} · {account.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
