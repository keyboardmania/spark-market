"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { TEST_VERIFICATION_CODE, createNickname, type SparkUser } from "@/data/mockData";
import { translate } from "@/i18n";
import { useI18n } from "@/features/i18n/useI18n";
import { fill } from "@/features/i18n/ui";
import { QuickFill } from "@/features/wireframe/QuickFill";
import { WIREFRAME_LOGIN } from "@/features/wireframe/demoProfile";

const SOCIAL_PROVIDERS = [
  { id: "line" as const, label: "socialLine" as const, name: "LINE", className: "bg-[#06C755] text-white", mark: "L" },
  { id: "google" as const, label: "socialGoogle" as const, name: "Google", className: "border border-slate-200 bg-white text-slate-900", mark: "G" },
  { id: "x" as const, label: "socialX" as const, name: "X", className: "bg-black text-white", mark: "𝕏" },
  { id: "apple" as const, label: "socialApple" as const, name: "Apple", className: "bg-slate-900 text-white", mark: "" },
];

type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];

function isEmailShape(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordIssue(password: string) {
  if (password.length < 10 || password.length > 20) return "passLength" as const;
  if (/[^A-Za-z0-9!~*^-]/.test(password)) return "passSymbol" as const;
  let kinds = 0;
  if (/[0-9]/.test(password)) kinds += 1;
  if (/[A-Z]/.test(password)) kinds += 1;
  if (/[a-z]/.test(password)) kinds += 1;
  if (/[!~*^-]/.test(password)) kinds += 1;
  if (kinds < 3) return "passKinds" as const;
  return null;
}

export function LoginScreen() {
  const router = useRouter();
  const { locale, t } = useI18n();
  const { login, authenticate, findAccount, notify } = useSpark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function enter(user: SparkUser) {
    const existing = findAccount(user.email);
    if (!existing || existing.provider !== user.provider) {
      setError(t("loginError"));
      return;
    }
    setError(null);
    login(existing);
    notify(fill(t("loginHello"), { name: existing.name }));
    router.push("/");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const user = authenticate(email, password);
    if (!user) {
      setError(t("loginError"));
      return;
    }
    setError(null);
    login(user);
    notify(fill(t("loginHello"), { name: user.name }));
    router.push("/");
  }

  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex justify-end">
          <QuickFill onFill={() => { setEmail(WIREFRAME_LOGIN.email); setPassword(WIREFRAME_LOGIN.password); setError(null); }} />
        </div>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">{t("loginEmail")}</span>
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
          <span className="text-xs text-slate-500">{t("loginPassword")}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("loginPasswordPh")}
            className={fieldClass}
          />
        </label>
        <button type="submit" className={`${primaryButtonClass} w-full`}>{t("loginSubmit")}</button>
        <p className="text-right text-sm">
          <Link href="/forgot" className="text-slate-500 hover:text-slate-900">{t("loginForgot")}</Link>
        </p>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
      <p className="mt-4 text-center text-sm text-slate-500">
        {t("loginNoAccount")} <Link href="/signup" className="font-medium text-slate-900">{t("loginSignup")}</Link>
      </p>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">
        {t("loginAgreeBefore")} <Link href="/legal/terms" className="underline">{translate(locale, "terms")}</Link> {t("loginAgreeAnd")} <Link href="/legal/privacy" className="underline">{translate(locale, "privacy")}</Link> {t("loginAgreeAfter")}
      </p>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-center text-xs text-slate-400">{t("loginSocial")}</p>
        <SocialRow onPick={enter} />
      </div>
    </AuthShell>
  );
}

export function SignupScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { notify, isEmailTaken, registerAccount, findAccount, login } = useSpark();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [codeSentFor, setCodeSentFor] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordError = password ? passwordIssue(password) : null;
  const confirmError = passwordConfirm && passwordConfirm !== password ? t("signupMismatch") : null;
  const emailKey = email.trim().toLowerCase();
  const emailError = signupEmailError(email, isEmailTaken(email));
  const codeSent = codeSentFor === emailKey && emailKey.length > 0;
  const verified = verifiedEmail === emailKey && emailKey.length > 0;

  function enterAs(next: SparkUser, password = "") {
    registerAccount({ ...next, password });
    login(next);
    notify(fill(t("signupHello"), { name: next.name }));
    router.push("/");
  }

  function finishSignup(provider: SparkUser["provider"]) {
    enterAs({ name: createNickname(), email: email.trim(), provider }, provider === "email" ? password : "");
  }

  function onEmailChange(value: string) {
    setEmail(value);
    setCode("");
    setError(null);
  }

  function requestVerification() {
    if (!isEmailShape(email) || isEmailTaken(email)) {
      setCodeSentFor(null);
      setVerifiedEmail(null);
      setCode("");
      setError(emailError ? null : t("emailFormat"));
      return;
    }
    setError(null);
    setCode("");
    setVerifiedEmail(null);
    setCodeSentFor(emailKey);
    notify(t("codeSent"));
  }

  function confirmVerification() {
    if (!codeSent) return;
    if (!/^\d{4,6}$/.test(code)) {
      setError(t("signupCodeDigits"));
      return;
    }
    if (code !== TEST_VERIFICATION_CODE) {
      setError(t("signupCodeBad"));
      return;
    }
    setError(null);
    setVerifiedEmail(emailKey);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!verified) {
      setError(t("signupNeedVerify"));
      return;
    }
    if (!isEmailShape(email) || emailError || passwordIssue(password)) {
      setError(emailError ? t(emailError) : t("signupCheck"));
      return;
    }
    if (!passwordConfirm || passwordConfirm !== password) {
      setError(passwordConfirm ? t("signupMismatch") : t("signupNeedConfirm"));
      return;
    }
    if (!terms || !privacy || !age) {
      setError(t("signupNeedTerms"));
      return;
    }
    if (isEmailTaken(email)) {
      setError(t("emailTaken"));
      return;
    }
    setError(null);
    finishSignup("email");
  }

  return (
    <AuthShell title={t("signupTitle")} subtitle={t("signupSubtitle")}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex justify-end">
          <QuickFill
            onFill={() => {
              const next = `wf${Date.now().toString().slice(-6)}@spark.market`;
              setEmail(next);
              setPassword(WIREFRAME_LOGIN.password);
              setPasswordConfirm(WIREFRAME_LOGIN.password);
              setTerms(true);
              setPrivacy(true);
              setAge(true);
              setCode("");
              setVerifiedEmail(null);
              setCodeSentFor(next.toLowerCase());
              setCode(TEST_VERIFICATION_CODE);
              setError(null);
            }}
          />
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-email" className="text-xs text-slate-500">{t("loginEmail")}</label>
          <div className="flex items-stretch gap-2">
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@spark.market"
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "signup-email-status" : undefined}
              className={`${fieldClass} min-w-0 flex-1 ${emailError ? "border-rose-300" : ""}`}
            />
            <button
              type="button"
              onClick={requestVerification}
              disabled={verified || Boolean(emailError)}
              className={`${ghostButtonClass} shrink-0 px-4 text-sm`}
            >
              {t("signupSendCode")}
            </button>
          </div>
          {emailError ? <p id="signup-email-status" role="alert" className="text-xs text-rose-600">{t(emailError)}</p> : null}
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-code" className="text-xs text-slate-500">{t("signupCode")}</label>
          <div className="flex items-stretch gap-2">
            <input
              id="signup-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              disabled={!codeSent || verified}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("signupCodePh")}
              aria-describedby="signup-code-status"
              className={`${fieldClass} min-w-0 flex-1 disabled:bg-slate-50 disabled:text-slate-400`}
            />
            <button
              type="button"
              onClick={confirmVerification}
              disabled={!codeSent || verified}
              className={`${ghostButtonClass} shrink-0 px-4`}
            >
              {verified ? t("signupVerified") : t("signupConfirmCode")}
            </button>
          </div>
          <p id="signup-code-status" role="status" className={`text-xs ${verified ? "font-medium text-emerald-600" : "text-slate-400"}`}>
            {verified ? t("signupVerified") : t("signupCodeHint")}
          </p>
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-password" className="text-xs text-slate-500">{t("signupPassword")}</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("signupPasswordPh")}
            aria-describedby="signup-password-hint"
            className={fieldClass}
          />
          <p id="signup-password-hint" className={`text-xs ${passwordError ? "text-rose-600" : "text-slate-400"}`}>
            {passwordError ? t(passwordError) : t("passHint")}
          </p>
        </div>
        <div className="block space-y-2">
          <label htmlFor="signup-password-confirm" className="text-xs text-slate-500">{t("signupPasswordConfirm")}</label>
          <input
            id="signup-password-confirm"
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) => {
              setPasswordConfirm(event.target.value);
              setError(null);
            }}
            placeholder={t("signupPasswordAgain")}
            aria-invalid={confirmError ? true : undefined}
            aria-describedby={confirmError ? "signup-password-confirm-hint" : undefined}
            className={`${fieldClass} ${confirmError ? "border-rose-300" : ""}`}
          />
          {confirmError ? <p id="signup-password-confirm-hint" role="alert" className="text-xs text-rose-600">{confirmError}</p> : null}
        </div>

        <div className="space-y-2 pt-2">
          <Check checked={terms} onChange={setTerms} label={t("signupTerms")} href="/legal/terms" viewLabel={t("viewLink")} />
          <Check checked={privacy} onChange={setPrivacy} label={t("signupPrivacy")} href="/legal/privacy" viewLabel={t("viewLink")} />
          <Check checked={age} onChange={setAge} label={t("signupAge")} />
          <Check checked={marketing} onChange={setMarketing} label={t("signupMarketing")} />
        </div>

        <button type="submit" disabled={!verified || Boolean(passwordError) || Boolean(confirmError)} className={`${primaryButtonClass} w-full`}>{t("signupDone")}</button>
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        {t("signupHasAccount")} <Link href="/login" className="font-medium text-slate-900">{t("signupLogin")}</Link>
      </p>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-center text-xs text-slate-400">또는 소셜 계정으로 가입하기</p>
        <SocialRow
          requireTerms
          onPick={(user) => {
            if (isEmailTaken(user.email)) {
              const existing = findAccount(user.email);
              if (!existing || existing.provider !== user.provider) {
                notify("이미 사용 중인 이메일입니다. 로그인해 주세요.");
                router.push("/login");
                return;
              }
              login(existing);
              notify(`${existing.name}님, Spark에 오신 것을 환영해요.`);
              router.push("/");
              return;
            }
            enterAs({ name: createNickname(), email: user.email, provider: user.provider });
          }}
        />
      </div>
    </AuthShell>
  );
}

function signupEmailError(email: string, taken: boolean) {
  const value = email.trim();
  if (!value.includes("@")) return null;
  if (!isEmailShape(value)) return "emailFormat" as const;
  if (taken) return "emailTaken" as const;
  return null;
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
  const { t } = useI18n();
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
          {t(item.label)}
        </button>
      ))}
      {provider && requireTerms && !agreed ? (
        <SocialTermsModal provider={provider} onCancel={close} onAgree={() => setAgreed(true)} />
      ) : null}
      {provider && (!requireTerms || agreed) ? (
        <SocialAuthModal
          provider={provider}
          onCancel={close}
          onSuccess={(email) => {
            const picked = {
              name: fill(t("socialUser"), { name: provider.name }),
              email,
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
  const { t } = useI18n();
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [age, setAge] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function agree() {
    if (!terms || !privacy || !age) {
      setError(t("signupNeedTerms"));
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
        <h2 id="social-terms-title" className="mt-2 text-lg font-semibold text-slate-900">{t("socialTermsTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {fill(t("socialTermsBody"), { name: provider.name })}
        </p>
        <div className="mt-4 space-y-1">
          <Check checked={terms} onChange={setTerms} label={t("signupTerms")} href="/legal/terms" viewLabel={t("viewLink")} />
          <Check checked={privacy} onChange={setPrivacy} label={t("signupPrivacy")} href="/legal/privacy" viewLabel={t("viewLink")} />
          <Check checked={age} onChange={setAge} label={t("signupAge")} />
          <Check checked={marketing} onChange={setMarketing} label={t("signupMarketing")} />
        </div>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <button type="button" onClick={agree} className={`${primaryButtonClass} mt-5 w-full`}>{t("socialAgree")}</button>
        <button type="button" onClick={onCancel} className={`${ghostButtonClass} mt-2 w-full`}>{t("cancel")}</button>
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
  onSuccess: (email: string) => void;
}) {
  const { t } = useI18n();
  const providedEmail = `${provider.id}.user@spark.market`;
  const [email, setEmail] = useState(providedEmail);
  const [error, setError] = useState<string | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  function finish() {
    if (!isEmailShape(email)) {
      setError(t("emailFormat"));
      return;
    }
    setError(null);
    onSuccessRef.current(email.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-auth-title"
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`px-6 py-4 text-sm font-medium ${provider.className}`}>{fill(t("socialMock"), { name: provider.name })}</div>
        <div className="px-6 py-5">
          <h2 id="social-auth-title" className="text-lg font-semibold text-slate-900">{fill(t("socialConnect"), { name: provider.name })}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {fill(t("socialMockBody"), { name: provider.name })}
          </p>
          <p className="mt-4 text-xs text-slate-400">{fill(t("socialEmailHint"), { name: provider.name })}</p>
          <label className="mt-3 block space-y-2 text-xs text-slate-500">{t("loginEmail")}
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} />
          </label>
          {error ? <p role="alert" className="mt-2 text-sm text-rose-600">{error}</p> : null}
          <button type="button" onClick={finish} className={`${primaryButtonClass} mt-4 w-full`}>{t("socialContinue")}</button>
          <button type="button" onClick={onCancel} className={`${ghostButtonClass} mt-2 w-full`}>
            {t("cancel")}
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

function Check({ checked, onChange, label, href, viewLabel = "보기" }: { checked: boolean; onChange: (value: boolean) => void; label: string; href?: string; viewLabel?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-xl px-1 py-1.5 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4" />
      <span>
        {label}
        {href ? (
          <>
            {" "}
            <Link href={href} className="text-slate-400 underline" onClick={(event) => event.stopPropagation()}>
              {viewLabel}
            </Link>
          </>
        ) : null}
      </span>
    </label>
  );
}
