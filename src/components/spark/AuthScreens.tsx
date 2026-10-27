"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import type { SparkUser } from "@/data/mockData";

export function LoginScreen() {
  const router = useRouter();
  const { login, notify } = useSpark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function enter(user: SparkUser) {
    login(user);
    notify(`${user.name}님, 어서 오세요.`);
    router.push("/mypage");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 8) {
      setError("이메일 형식과 8자 이상 비밀번호를 확인해 주세요.");
      return;
    }
    enter({ name: email.split("@")[0] || "스파크", email, provider: "email" });
  }

  return (
    <AuthShell title="다시 만나서 반가워요" subtitle="소셜 계정 또는 이메일로 들어올 수 있어요.">
      <SocialRow onPick={enter} />
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">이메일</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@spark.market" className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">비밀번호</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상" className={fieldClass} />
        </label>
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" className={`${primaryButtonClass} w-full`}>이메일로 로그인</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        계정이 없으신가요? <Link href="/signup" className="font-medium text-slate-900">회원가입</Link>
      </p>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        로그인하면 <Link href="/legal/terms" className="underline">이용약관</Link>과 <Link href="/legal/privacy" className="underline">개인정보처리방침</Link>에 동의하게 돼요.
      </p>
      <AdultVerifyCard />
    </AuthShell>
  );
}

export function SignupScreen() {
  const router = useRouter();
  const { login, adultVerified, notify } = useSpark();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = terms && privacy && age && adultVerified && name.trim() && email.includes("@") && password.length >= 8 && password === confirm;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready) {
      setError("필수 약관과 성인 인증, 계정 정보를 모두 채워 주세요.");
      return;
    }
    login({ name: name.trim(), email, provider: "email" });
    notify("가입이 완료되었어요.");
    router.push("/mypage");
  }

  return (
    <AuthShell title="Spark에 가입하기" subtitle="약관에 동의하고 성인 인증을 마치면 계정이 열려요.">
      <SocialRow
        onPick={(user) => {
          if (!adultVerified) {
            setError("소셜 가입 전에 아래 성인 인증을 완료해 주세요.");
            return;
          }
          login({ ...user, name });
          notify("가입이 완료되었어요.");
          router.push("/mypage");
        }}
      />
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">이름</span>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="김서연" className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">이메일</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@spark.market" className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">비밀번호</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8자 이상" className={fieldClass} />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">비밀번호 확인</span>
          <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className={fieldClass} />
        </label>

        <div className="space-y-2 pt-2">
          <Check checked={terms} onChange={setTerms} label="[필수] 서비스 이용약관 동의" href="/legal/terms" />
          <Check checked={privacy} onChange={setPrivacy} label="[필수] 개인정보 수집 및 이용 동의" href="/legal/privacy" />
          <Check checked={age} onChange={setAge} label="[필수] 만 14세 이상입니다" />
          <Check checked={marketing} onChange={setMarketing} label="[선택] 마케팅 정보 수신 동의" />
        </div>

        <AdultVerifyCard />
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" disabled={!ready} className={`${primaryButtonClass} w-full`}>
          회원가입
        </button>
        <p className="text-center text-xs text-slate-400">필수 약관과 성인 인증이 끝나면 버튼이 켜져요.</p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="bg-slate-50/60">
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <p className="font-serif text-3xl italic text-slate-900">Spark</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function SocialRow({ onPick }: { onPick: (user: SparkUser) => void }) {
  const providers = [
    { id: "kakao" as const, label: "카카오로 계속하기", className: "bg-[#FEE500] text-slate-900" },
    { id: "naver" as const, label: "네이버로 계속하기", className: "bg-[#03C75A] text-white" },
    { id: "apple" as const, label: "Apple로 계속하기", className: "bg-slate-900 text-white" },
  ];

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onPick({ name: "스파크", email: `${provider.id}@spark.market`, provider: provider.id })}
          className={`w-full rounded-full px-4 py-3 text-sm font-medium ${provider.className}`}
        >
          {provider.label}
        </button>
      ))}
    </div>
  );
}

function Check({ checked, onChange, label, href }: { checked: boolean; onChange: (value: boolean) => void; label: string; href?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl px-1 py-1.5 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4" />
      <span>
        {label}
        {href ? (
          <>
            {" "}
            <Link href={href} className="text-slate-400 underline" onClick={(event) => event.stopPropagation()}>
              보기
            </Link>
          </>
        ) : null}
      </span>
    </label>
  );
}

export function AdultVerifyCard() {
  const { adultVerified, verifyAdult, notify } = useSpark();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="mt-5 rounded-2xl bg-slate-50 p-4">
      <h2 className="text-sm font-medium text-slate-900">성인 인증</h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">만 19세 이상 확인이 필요한 매물을 위해 휴대폰 본인인증을 진행해요. 데모에서는 숫자 6자리만 입력하면 완료됩니다.</p>
      {adultVerified ? (
        <p className="mt-3 text-sm font-medium text-emerald-700">성인 인증이 완료되었어요.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {!sent ? (
            <button type="button" onClick={() => setSent(true)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
              인증번호 받기
            </button>
          ) : (
            <>
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="인증번호 6자리"
                className={fieldClass}
                aria-label="인증번호"
              />
              <button
                type="button"
                onClick={() => {
                  if (code.length < 6) {
                    setError("인증번호 6자리를 입력해 주세요.");
                    return;
                  }
                  verifyAdult();
                  notify("성인 인증이 완료되었어요.");
                  setError(null);
                }}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
              >
                인증 완료
              </button>
            </>
          )}
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
