"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_ACCOUNTS, ADMIN_DEMO } from "@/data/mockData";
import { useAdmin, type AdminLoginFailure } from "@/components/spark/AdminProvider";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";

export function AdminLogin() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, ready, session } = useAdmin();
  const [email, setEmail] = useState<string>(ADMIN_DEMO.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<AdminLoginFailure | null>(null);

  useEffect(() => {
    if (!ready || !session || pathname !== "/admin/login") return;
    router.replace("/admin");
  }, [ready, session, pathname, router]);

  function submit() {
    const result = login(email, password);
    if (!result.ok) {
      setError(result);
      return;
    }
    setError(null);
    router.replace("/admin");
  }

  if (!ready) {
    return <p className="grid min-h-dvh place-items-center bg-slate-50 text-sm text-slate-400">세션을 확인하고 있어요.</p>;
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
          <label className="block text-xs font-medium text-slate-500" htmlFor="admin-email">
            이메일
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={error?.field === "email"}
            className={fieldClass}
          />
          <label className="block text-xs font-medium text-slate-500" htmlFor="admin-password">
            비밀번호
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error?.field === "password"}
            className={fieldClass}
          />
          {error ? (
            <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error.field === "email" ? "이메일" : error.field === "password" ? "비밀번호" : "세션"}: {error.message}
            </p>
          ) : null}
          <button type="submit" className={`${primaryButtonClass} w-full`}>
            관리자 로그인
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <p>데모 비밀번호는 {ADMIN_DEMO.password} 입니다.</p>
          <ul className="mt-2 space-y-1">
            {ADMIN_ACCOUNTS.map((account) => (
              <li key={account.id}>
                {account.role} · {account.email}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
