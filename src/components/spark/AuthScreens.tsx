"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { createNickname, type SparkUser } from "@/data/mockData";

const LOGIN_ERROR = "이메일 또는 비밀번호가 올바르지 않습니다.";
const TEST_VERIFICATION_CODE = "5825";
const VERIFICATION_SENT = "인증번호가 발송되었습니다. (테스트 번호: 5825)";

const SOCIAL_PROVIDERS = [
  { id: "line" as const, label: "LINE으로 계속하기", name: "LINE", className: "bg-[#06C755] text-white", mark: "L" },
  { id: "google" as const, label: "Google로 계속하기", name: "Google", className: "border border-slate-200 bg-white text-slate-900", mark: "G" },
  { id: "x" as const, label: "X로 계속하기", name: "X", className: "bg-black text-white", mark: "𝕏" },
  { id: "apple" as const, label: "Apple로 계속하기", name: "Apple", className: "bg-slate-900 text-white", mark: "" },
];

type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];

function isEmailShape(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function passwordIssue(password: string) {
  if (password.length < 10 || password.length > 20) return "비밀번호는 10~20자로 입력해 주세요.";
  if (/[^A-Za-z0-9!~*^-]/.test(password)) return "특수기호는 ! ~ - * ^ 만 사용할 수 있어요.";
  let kinds = 0;
  if (/[0-9]/.test(password)) kinds += 1;
  if (/[A-Z]/.test(password)) kinds += 1;
  if (/[a-z]/.test(password)) kinds += 1;
  if (/[!~*^-]/.test(password)) kinds += 1;
  if (kinds < 3) return "숫자, 대문자, 소문자, 특수기호(! ~ - * ^) 중 3종류 이상을 조합해 주세요.";
  return null;
}

export function LoginScreen() {
  const router = useRouter();
  const { login, authenticate, findAccount, notify } = useSpark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function enter(user: SparkUser) {
    const existing = findAccount(user.email);
    if (!existing || existing.provider !== user.provider) {
      setError("가입된 소셜 계정이 없습니다. 회원가입에서 연결한 뒤 이 화면에서 다시 로그인해 주세요.");
      return;
    }
    setError(null);
    login(existing);
    notify(`${existing.name}님, 어서 오세요.`);
    router.push("/");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const user = authenticate(email, password);
    if (!user) {
      setError(LOGIN_ERROR);
      return;
    }
    setError(null);
    login(user);
    notify(`${user.name}님, 어서 오세요.`);
    router.push("/");
  }

  return (
    <AuthShell title="다시 만나서 반가워요" subtitle="소셜 계정 또는 이메일로 들어올 수 있어요.">
      <SocialRow onPick={enter} />
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">이메일</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@spark.market"
            className={fieldClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호"
            className={fieldClass}
          />
        </label>
        <button type="submit" className={`${primaryButtonClass} w-full`}>이메일로 로그인</button>
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        계정이 없으신가요? <Link href="/signup" className="font-medium text-slate-900">회원가입</Link>
      </p>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        로그인하면 <Link href="/legal/terms" className="underline">이용약관</Link>과 <Link href="/legal/privacy" className="underline">개인정보처리방침</Link>에 동의하게 돼요.
      </p>
    </AuthShell>
  );
}

export function SignupScreen() {
  const router = useRouter();
  const { notify, isEmailTaken, registerAccount } = useSpark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSentFor, setCodeSentFor] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordError = password ? passwordIssue(password) : null;
  const emailKey = email.trim().toLowerCase();
  const codeSent = codeSentFor === emailKey && emailKey.length > 0;
  const verified = verifiedEmail === emailKey && emailKey.length > 0;

  function finishSignup(provider: SparkUser["provider"]) {
    const next = { name: createNickname(), email: email.trim(), provider };
    registerAccount({ ...next, password: provider === "email" ? password : "" });
    notify("가입이 완료되었어요. 로그인해 주세요.");
    router.push("/login");
  }

  function onEmailChange(value: string) {
    setEmail(value);
    setCode("");
    setError(null);
  }

  function requestVerification() {
    if (!isEmailShape(email)) {
      setError("이메일 형식을 확인해 주세요.");
      return;
    }
    if (isEmailTaken(email)) {
      setCodeSentFor(null);
      setVerifiedEmail(null);
      setCode("");
      setError("이미 사용 중인 이메일입니다.");
      return;
    }
    setError(null);
    setCode("");
    setVerifiedEmail(null);
    setCodeSentFor(emailKey);
    notify(VERIFICATION_SENT);
  }

  function confirmVerification() {
    if (!codeSent) return;
    if (!/^\d{4,6}$/.test(code)) {
      setError("인증번호는 4~6자리 숫자로 입력해 주세요.");
      return;
    }
    if (code !== TEST_VERIFICATION_CODE) {
      setError("인증번호가 올바르지 않습니다.");
      return;
    }
    setError(null);
    setVerifiedEmail(emailKey);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!verified) {
      setError("이메일 인증을 완료해 주세요.");
      return;
    }
    if (!isEmailShape(email) || passwordIssue(password)) {
      setError("이메일과 비밀번호를 확인해 주세요.");
      return;
    }
    if (!terms || !privacy || !age) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }
    if (isEmailTaken(email)) {
      setError("이미 사용 중인 이메일입니다.");
      return;
    }
    setError(null);
    finishSignup("email");
  }

  return (
    <AuthShell title="Spark에 가입하기" subtitle="이메일과 비밀번호만 있으면 돼요. 닉네임은 자동으로 만들어집니다.">
      <SocialRow
        requireTerms
        onPick={(user) => {
          if (!isEmailTaken(user.email)) {
            registerAccount({ name: createNickname(), email: user.email, password: "", provider: user.provider });
          }
          notify("가입이 완료되었어요. 로그인 화면에서 소셜 로그인을 다시 진행해 주세요.");
          router.replace("/login");
        }}
      />
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <div className="block space-y-2">
          <label htmlFor="signup-email" className="text-xs text-slate-500">이메일</label>
          <div className="flex items-stretch gap-2">
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@spark.market"
              className={`${fieldClass} min-w-0 flex-1`}
            />
            <button
              type="button"
              onClick={requestVerification}
              className={`${ghostButtonClass} w-[7.5rem] shrink-0 whitespace-normal px-2.5 py-2 text-center text-xs leading-4`}
            >
              중복확인 및
              <br />
              인증번호 발송
            </button>
          </div>
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-code" className="text-xs text-slate-500">인증번호</label>
          <div className="flex items-stretch gap-2">
            <input
              id="signup-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              disabled={!codeSent || verified}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="4~6자리"
              aria-describedby="signup-code-status"
              className={`${fieldClass} min-w-0 flex-1 disabled:bg-slate-50 disabled:text-slate-400`}
            />
            <button
              type="button"
              onClick={confirmVerification}
              disabled={!codeSent || verified}
              className={`${ghostButtonClass} shrink-0 px-4`}
            >
              {verified ? "인증 완료" : "인증 확인"}
            </button>
          </div>
          <p id="signup-code-status" role="status" className={`text-xs ${verified ? "font-medium text-emerald-600" : "text-slate-400"}`}>
            {verified ? "인증 완료" : "인증번호는 4~6자리입니다."}
          </p>
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-password" className="text-xs text-slate-500">비밀번호</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="10~20자"
            aria-describedby="signup-password-hint"
            className={fieldClass}
          />
          <p id="signup-password-hint" className={`text-xs ${passwordError ? "text-rose-600" : "text-slate-400"}`}>
            {passwordError ?? "10~20자, 숫자·대문자·소문자·특수기호(! ~ - * ^) 중 3종류 이상"}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Check checked={terms} onChange={setTerms} label="[필수] 서비스 이용약관 동의" href="/legal/terms" />
          <Check checked={privacy} onChange={setPrivacy} label="[필수] 개인정보 수집 및 이용 동의" href="/legal/privacy" />
          <Check checked={age} onChange={setAge} label="[필수] 만 14세 이상입니다" />
          <Check checked={marketing} onChange={setMarketing} label="[선택] 마케팅 정보 수신 동의" />
        </div>

        <button type="submit" disabled={!verified} className={`${primaryButtonClass} w-full`}>완료</button>
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        이미 계정이 있으신가요? <Link href="/login" className="font-medium text-slate-900">로그인</Link>
      </p>
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

function SocialRow({ onPick, requireTerms = false }: { onPick: (user: SparkUser) => void; requireTerms?: boolean }) {
  const [active, setActive] = useState<SocialProviderId | null>(null);
  const [agreed, setAgreed] = useState(false);
  const provider = SOCIAL_PROVIDERS.find((item) => item.id === active);

  function close() {
    setActive(null);
    setAgreed(false);
  }

  return (
    <div className="space-y-2">
      {SOCIAL_PROVIDERS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            setAgreed(false);
            setActive(item.id);
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium ${item.className}`}
        >
          <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center text-xs font-semibold">
            {item.id === "apple" ? <AppleMark /> : item.mark}
          </span>
          {item.label}
        </button>
      ))}
      {provider && requireTerms && !agreed ? (
        <SocialTermsModal provider={provider} onCancel={close} onAgree={() => setAgreed(true)} />
      ) : null}
      {provider && (!requireTerms || agreed) ? (
        <SocialAuthModal
          provider={provider}
          onCancel={close}
          onSuccess={() => {
            const picked = {
              name: `${provider.name} 사용자`,
              email: `${provider.id}.user@spark.market`,
              provider: provider.id,
            };
            close();
            onPick(picked);
          }}
        />
      ) : null}
    </div>
  );
}

function SocialTermsModal({
  provider,
  onCancel,
  onAgree,
}: {
  provider: (typeof SOCIAL_PROVIDERS)[number];
  onCancel: () => void;
  onAgree: () => void;
}) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function agree() {
    if (!terms || !privacy || !age) {
      setError("필수 약관에 동의해 주세요.");
      return;
    }
    onAgree();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-terms-title"
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[11px] font-medium tracking-[0.18em] text-slate-400">{provider.name}</p>
        <h2 id="social-terms-title" className="mt-2 text-lg font-semibold text-slate-900">소셜 회원가입 약관 동의</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {provider.name} 계정으로 가입하려면 필수 약관에 동의해 주세요. 동의하기 전에는 계정이 만들어지지 않습니다.
        </p>
        <div className="mt-4 space-y-1">
          <Check checked={terms} onChange={setTerms} label="[필수] 서비스 이용약관 동의" href="/legal/terms" />
          <Check checked={privacy} onChange={setPrivacy} label="[필수] 개인정보 수집 및 이용 동의" href="/legal/privacy" />
          <Check checked={age} onChange={setAge} label="[필수] 만 14세 이상입니다" />
          <Check checked={marketing} onChange={setMarketing} label="[선택] 마케팅 정보 수신 동의" />
        </div>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <button type="button" onClick={agree} className={`${primaryButtonClass} mt-5 w-full`}>동의하고 가입하기</button>
        <button type="button" onClick={onCancel} className={`${ghostButtonClass} mt-2 w-full`}>취소</button>
      </div>
    </div>
  );
}

function SocialAuthModal({
  provider,
  onCancel,
  onSuccess,
}: {
  provider: (typeof SOCIAL_PROVIDERS)[number];
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const onSuccessRef = useRef(onSuccess);
  const finished = useRef(false);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      onSuccessRef.current();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-auth-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`px-6 py-4 text-sm font-medium ${provider.className}`}>{provider.name} 가상 인증</div>
        <div className="px-6 py-5">
          <h2 id="social-auth-title" className="text-lg font-semibold text-slate-900">{provider.name} 계정으로 연결</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Spark가 {provider.name} 계정의 기본 프로필을 확인합니다. 이 창은 실제 서비스로 이동하지 않는 가상 인증입니다.
          </p>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-700">{provider.id}.user@spark.market</p>
          <div className="mt-5 flex flex-col items-center gap-3 py-3" role="status" aria-live="polite">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            <p className="text-sm text-slate-500">계정 연동 중</p>
          </div>
          <button type="button" onClick={onCancel} className={`${ghostButtonClass} mt-2 w-full`}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M11.2 8.4c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.8 1.7-1.2 2.1-.3 5.2.9 6.9.6.8 1.3 1.8 2.2 1.7.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6 1.5-.8 2.1-1.7c.7-1 .9-1.9 1-2-.1 0-1.8-.7-1.8-2.9zM9.7 3.8c.5-.6.8-1.4.7-2.3-.7 0-1.5.5-2 .1-.5.6-.9 1.5-.8 2.3.8.1 1.6-.4 2.1-1z" />
    </svg>
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
