"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertsPanel } from "@/components/spark/AlertsPanel";
import { passwordIssue } from "@/components/spark/AuthScreens";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { BANK_LIMIT, TEST_VERIFICATION_CODE } from "@/data/mockData";
import { useI18n } from "@/features/i18n/useI18n";
import { fill } from "@/features/i18n/ui";
import { QuickFill } from "@/features/wireframe/QuickFill";
import { QUICK_BANK } from "@/features/wireframe/demoProfile";
import { useShared } from "@/data/shared";

const SIMULATED_DELAY_MS = 800;

function waitForServer() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, SIMULATED_DELAY_MS);
  });
}

function useAlive() {
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  return alive;
}

function ButtonSpinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" aria-hidden />;
}

function PendingButton({
  pending,
  label,
  busyLabel,
  className,
  type = "submit",
  disabled = false,
  onClick,
}: {
  pending: boolean;
  label: string;
  busyLabel: string;
  className: string;
  type?: "submit" | "button";
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled || pending} aria-busy={pending} className={`${className} gap-2`}>
      {pending ? (
        <>
          <ButtonSpinner />
          {busyLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

export function LoginHint() {
  return (
    <p className="text-sm leading-6 text-slate-500">
      로그인하면 이 설정을 바꿀 수 있어요.{" "}
      <Link href="/login" className="font-medium text-slate-900">로그인</Link>
    </p>
  );
}

export function AccountPanels() {
  const { user, retention } = useSpark();

  return (
    <div className="mt-10 space-y-8">
      {retention ? (
        <section className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          {retention.hasTrades
            ? `탈퇴한 계정의 식별 정보는 암호화되어 ${retention.retainUntil}까지 보관됩니다. 운영자는 원문에 접근할 수 없고, 보관 토큰은 ${retention.token}입니다.`
            : "거래 내역이 없어 계정은 즉시 삭제되었습니다."}
        </section>
      ) : null}
      {user ? (
        <>
          <ProfileForm />
          <AlertsPanel />
          <BankPanel />
          <PasswordPanel />
          <ReviewsPanel />
          <WithdrawPanel />
        </>
      ) : null}
    </div>
  );
}

export function ProfileForm() {
  const router = useRouter();
  const alive = useAlive();
  const mounted = useMounted();
  const { user, updateProfile } = useSpark();
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [syncedEmail, setSyncedEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (mounted && user && user.email !== syncedEmail) {
    setSyncedEmail(user.email);
    setName(user.name);
    setPhotoUrl(user.photoUrl);
  }

  if (!mounted || !user) return <LoginHint />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setError("닉네임을 입력해 주세요.");
      return;
    }
    setError(null);
    setPending(true);
    await waitForServer();
    if (!alive.current) return;
    const saved = updateProfile({ name: nextName, photoUrl });
    if (!alive.current) return;
    if (!saved) {
      setPending(false);
      setError("회원 정보를 브라우저에 저장하지 못했어요. 사진 용량을 줄인 뒤 다시 시도해 주세요.");
      return;
    }
    router.push("/mypage");
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">회원 정보</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">닉네임과 프로필 사진을 바꾸면 이 브라우저에 저장됩니다. 이메일은 수정할 수 없어요.</p>
      <form className="mt-4 grid max-w-md gap-3" onSubmit={onSubmit} aria-busy={pending}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">프로필 사진</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            disabled={pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") setPhotoUrl(reader.result);
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">닉네임</span>
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            disabled={pending}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">이메일</span>
          <input value={user.email} readOnly className={`${fieldClass} bg-slate-50 text-slate-500`} />
        </label>
        <PendingButton pending={pending} label="회원 정보 저장" busyLabel="저장 중" className={primaryButtonClass} />
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}

export function BankPanel() {
  const { user, banks, addBank, removeBank } = useSpark();
  if (!user) return <LoginHint />;
  return <BankForm banks={banks} addBank={addBank} removeBank={removeBank} />;
}

function BankForm({
  banks,
  addBank,
  removeBank,
}: {
  banks: ReturnType<typeof useSpark>["banks"];
  addBank: ReturnType<typeof useSpark>["addBank"];
  removeBank: ReturnType<typeof useSpark>["removeBank"];
}) {
  const [holder, setHolder] = useState("");
  const [bank, setBank] = useState("");
  const [number, setNumber] = useState("");
  const [isDefault, setIsDefault] = useState(banks.length === 0);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  return (
    <section id="accounts">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("bankTitle")}</h2>
          <p className="mt-1 text-xs text-slate-400">{fill(t("bankHint"), { count: String(BANK_LIMIT) })}</p>
        </div>
        <QuickFill
          onFill={() => {
            setHolder(QUICK_BANK.holder);
            setBank(QUICK_BANK.bank);
            setNumber(QUICK_BANK.number);
            setIsDefault(true);
            setError(null);
          }}
        />
      </div>
      <ul className="mt-3 space-y-2">
        {banks.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            <span>{item.bank} · {item.holder} · {item.number}{item.isDefault ? ` · ${t("bankDefaultTag")}` : ""}</span>
            <button type="button" onClick={() => removeBank(item.id)} className="text-xs text-slate-400">{t("bankDelete")}</button>
          </li>
        ))}
      </ul>
      <form
        className="mt-3 grid max-w-md gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!holder.trim() || !bank.trim() || !number.trim()) return;
          const result = addBank({ holder: holder.trim(), bank: bank.trim(), number: number.trim(), isDefault });
          if (result === "limit") {
            setError(fill(t("bankLimit"), { count: String(BANK_LIMIT) }));
            return;
          }
          setHolder("");
          setBank("");
          setNumber("");
          setError(null);
        }}
      >
        <input value={holder} onChange={(event) => setHolder(event.target.value)} placeholder={t("bankHolder")} className={fieldClass} />
        <input value={bank} onChange={(event) => setBank(event.target.value)} placeholder={t("bankBank")} className={fieldClass} />
        <input value={number} onChange={(event) => setNumber(event.target.value)} placeholder={t("bankNumber")} className={fieldClass} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
          {t("bankDefault")}
        </label>
        <button type="submit" className={ghostButtonClass}>{t("bankAdd")}</button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}

type PasswordStep = "current" | "verify" | "next";
type PasswordPending = "current" | "send" | "code" | "save" | null;

const PASSWORD_STEPS: { id: PasswordStep; label: string }[] = [
  { id: "current", label: "현재 비밀번호" },
  { id: "verify", label: "이메일 인증" },
  { id: "next", label: "새 비밀번호" },
];

export function PasswordPanel() {
  const mounted = useMounted();
  const { user, requestResetCode, changePassword, confirmPassword } = useSpark();
  if (!mounted || !user) return <LoginHint />;
  if (user.provider !== "email") {
    return (
      <section>
        <h2 className="text-lg font-semibold text-slate-900">비밀번호 변경</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
          소셜 로그인 계정은 비밀번호가 없어요. 닉네임과 사진은{" "}
          <Link href="/mypage/profile" className="font-medium text-slate-900">회원 정보</Link>
          에서 바꿀 수 있어요.
        </p>
      </section>
    );
  }
  return (
    <PasswordForm
      email={user.email}
      requestResetCode={requestResetCode}
      confirmPassword={confirmPassword}
      changePassword={changePassword}
    />
  );
}

function PasswordForm({
  email,
  requestResetCode,
  confirmPassword,
  changePassword,
}: {
  email: string;
  requestResetCode: (email: string) => boolean;
  confirmPassword: (email: string, password: string) => boolean;
  changePassword: (email: string, currentPassword: string, code: string, nextPassword: string) => boolean;
}) {
  const router = useRouter();
  const alive = useAlive();
  const { t } = useI18n();
  const [step, setStep] = useState<PasswordStep>("current");
  const [pending, setPending] = useState<PasswordPending>(null);
  const [current, setCurrent] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const issue = next ? passwordIssue(next) : null;
  const busy = pending !== null;

  async function onConfirmCurrent(event: FormEvent) {
    event.preventDefault();
    if (!current) {
      setError(t("passCurrentNeed"));
      return;
    }
    setError(null);
    setPending("current");
    await waitForServer();
    if (!alive.current) return;
    if (!confirmPassword(email, current)) {
      setPending(null);
      setError(t("passCurrentBad"));
      return;
    }
    setPending(null);
    setStep("verify");
  }

  async function onSendCode() {
    setError(null);
    setPending("send");
    await waitForServer();
    if (!alive.current) return;
    if (!requestResetCode(email)) {
      setSent(false);
      setPending(null);
      setError("인증번호를 보내지 못했어요. 이메일 계정을 확인해 주세요.");
      return;
    }
    setSent(true);
    setPending(null);
  }

  async function onConfirmCode(event: FormEvent) {
    event.preventDefault();
    if (!sent) {
      setError("먼저 인증번호를 받아 주세요.");
      return;
    }
    setError(null);
    setPending("code");
    await waitForServer();
    if (!alive.current) return;
    if (code.trim() !== TEST_VERIFICATION_CODE) {
      setPending(null);
      setError("인증번호가 맞지 않아요.");
      return;
    }
    setPending(null);
    setStep("next");
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault();
    if (!next || issue) return;
    if (next === current) {
      setError(t("passDifferent"));
      return;
    }
    setError(null);
    setPending("save");
    await waitForServer();
    if (!alive.current) return;
    if (!changePassword(email, current, code.trim(), next)) {
      setPending(null);
      setStep("current");
      setError(t("passFailed"));
      return;
    }
    router.push("/mypage");
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">비밀번호 변경</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">현재 비밀번호를 확인한 뒤, 이메일 인증번호로 새 비밀번호를 저장합니다.</p>
      <StepRail steps={PASSWORD_STEPS} step={step} label="비밀번호 변경 단계" />
      {step === "current" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onConfirmCurrent} aria-busy={busy}>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">현재 비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              disabled={busy}
              onChange={(event) => {
                setCurrent(event.target.value);
                setError(null);
              }}
              className={fieldClass}
            />
          </label>
          <PendingButton pending={pending === "current"} label="다음" busyLabel="확인 중" className={primaryButtonClass} />
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
      {step === "verify" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onConfirmCode} aria-busy={busy}>
          <p className="text-sm leading-6 text-slate-600">
            <span className="font-medium text-slate-900">{email}</span>로 인증번호를 보냅니다. 테스트 번호는 {TEST_VERIFICATION_CODE}입니다.
          </p>
          <PendingButton
            type="button"
            pending={pending === "send"}
            disabled={busy && pending !== "send"}
            label={sent ? "인증번호 다시 받기" : "인증번호 받기"}
            busyLabel="발송 중"
            className={ghostButtonClass}
            onClick={onSendCode}
          />
          {sent ? <p role="status" className="text-xs text-slate-500">인증번호를 보냈습니다. 아래에 입력해 주세요.</p> : null}
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">인증번호</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              disabled={!sent || busy}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              placeholder="4~6자리"
              className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
            />
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => { setError(null); setStep("current"); }} className={ghostButtonClass}>이전</button>
            <PendingButton
              pending={pending === "code"}
              disabled={!sent || code.trim().length < 4 || (busy && pending !== "code")}
              label="다음"
              busyLabel="확인 중"
              className={`${primaryButtonClass} flex-1`}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
      {step === "next" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onChangePassword} aria-busy={busy}>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">새 비밀번호</span>
            <input
              type="password"
              autoComplete="new-password"
              value={next}
              disabled={busy}
              onChange={(event) => {
                setNext(event.target.value);
                setError(null);
              }}
              placeholder={t("passNextPh")}
              className={fieldClass}
            />
            <span className={`text-xs ${issue ? "text-rose-600" : "text-slate-400"}`}>
              {issue ? t(issue) : t("passHint")}
            </span>
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => { setError(null); setStep("verify"); }} className={ghostButtonClass}>이전</button>
            <PendingButton
              pending={pending === "save"}
              disabled={!next || Boolean(issue) || (busy && pending !== "save")}
              label="비밀번호 변경"
              busyLabel="변경 중"
              className={`${primaryButtonClass} flex-1`}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
    </section>
  );
}

function StepRail({ steps, step, label = "진행 단계" }: { steps: { id: string; label: string }[]; step: string; label?: string }) {
  const index = steps.findIndex((item) => item.id === step);
  return (
    <ol className="mt-5 flex gap-3" aria-label={label}>
      {steps.map((item, itemIndex) => {
        const active = itemIndex === index;
        return (
          <li key={item.id} className="min-w-0 flex-1" aria-current={active ? "step" : undefined}>
            <p className={`truncate text-xs ${active ? "font-medium text-slate-900" : itemIndex < index ? "text-slate-500" : "text-slate-300"}`}>
              {itemIndex + 1}. {item.label}
            </p>
            <span className={`mt-2 block h-0.5 rounded-full ${itemIndex <= index ? "bg-slate-900" : "bg-slate-200"}`} />
          </li>
        );
      })}
    </ol>
  );
}

const WITHDRAW_PHRASE = "탈퇴하겠습니다";
type WithdrawStep = "password" | "code" | "phrase";
type WithdrawPending = "password" | "send" | "code" | "leave" | null;

const EMAIL_WITHDRAW_STEPS: { id: WithdrawStep; label: string }[] = [
  { id: "password", label: "비밀번호 확인" },
  { id: "code", label: "인증번호" },
  { id: "phrase", label: "탈퇴 확인" },
];

const SOCIAL_WITHDRAW_STEPS: { id: WithdrawStep; label: string }[] = [
  { id: "code", label: "인증번호" },
  { id: "phrase", label: "탈퇴 확인" },
];

export function WithdrawPanel() {
  const router = useRouter();
  const { user, withdraw, confirmPassword, requestResetCode } = useSpark();
  if (!user) return <LoginHint />;
  return (
    <WithdrawForm
      email={user.email}
      provider={user.provider}
      confirmPassword={confirmPassword}
      requestResetCode={requestResetCode}
      withdraw={withdraw}
      onDone={() => router.replace("/")}
    />
  );
}

export { AlertsPanel };

export function ReviewsPanel() {
  const { user } = useSpark();
  const reviews = useShared().reviews.filter((review) => !review.deletedAt && review.author === user?.name);
  if (!user) return <LoginHint />;
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">내 리뷰</h2>
      {reviews.length === 0 ? <p className="mt-3 text-sm text-slate-400">작성한 리뷰가 없어요.</p> : (
        <ul className="mt-3 space-y-2">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
              <p className="text-slate-800">{"★".repeat(review.rating)} {review.text}</p>
              <p className="mt-1 text-xs text-slate-400">사진·동영상 보관 만료 {review.mediaExpiresAt}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WithdrawForm({
  email,
  provider,
  confirmPassword,
  requestResetCode,
  withdraw,
  onDone,
}: {
  email: string;
  provider: string;
  confirmPassword: (email: string, password: string) => boolean;
  requestResetCode: (email: string) => boolean;
  withdraw: (input: { password?: string; code?: string }) => "ok" | "bad-password" | "bad-code" | "guest";
  onDone: () => void;
}) {
  const alive = useAlive();
  const needsPassword = provider === "email";
  const steps = needsPassword ? EMAIL_WITHDRAW_STEPS : SOCIAL_WITHDRAW_STEPS;
  const [step, setStep] = useState<WithdrawStep>(needsPassword ? "password" : "code");
  const [pending, setPending] = useState<WithdrawPending>(null);
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [phrase, setPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const busy = pending !== null;
  const phraseReady = phrase.trim() === WITHDRAW_PHRASE;
  const phraseError = phrase.length > 0 && !phraseReady ? "탈퇴하겠습니다 를 그대로 입력해 주세요." : null;

  async function onConfirmPassword(event: FormEvent) {
    event.preventDefault();
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }
    setError(null);
    setPending("password");
    await waitForServer();
    if (!alive.current) return;
    if (!confirmPassword(email, password)) {
      setPending(null);
      setError("비밀번호가 맞지 않아요.");
      return;
    }
    setPending(null);
    setStep("code");
  }

  async function onSendCode() {
    setError(null);
    setPending("send");
    await waitForServer();
    if (!alive.current) return;
    if (!requestResetCode(email)) {
      setSent(false);
      setPending(null);
      setError("인증번호를 보내지 못했어요. 이메일 계정을 확인해 주세요.");
      return;
    }
    setSent(true);
    setPending(null);
  }

  async function onConfirmCode(event: FormEvent) {
    event.preventDefault();
    if (!sent) {
      setError("먼저 인증번호를 받아 주세요.");
      return;
    }
    setError(null);
    setPending("code");
    await waitForServer();
    if (!alive.current) return;
    if (code.trim() !== TEST_VERIFICATION_CODE) {
      setPending(null);
      setError("인증번호가 맞지 않아요.");
      return;
    }
    setPending(null);
    setStep("phrase");
  }

  async function onLeave(event: FormEvent) {
    event.preventDefault();
    if (!phraseReady) {
      setError("탈퇴하겠습니다 를 그대로 입력해 주세요.");
      return;
    }
    setError(null);
    setPending("leave");
    await waitForServer();
    if (!alive.current) return;
    const result = withdraw({ password, code: code.trim() });
    if (!alive.current) return;
    if (result === "ok") {
      onDone();
      return;
    }
    setPending(null);
    if (result === "bad-password") {
      setStep(needsPassword ? "password" : "code");
      setError("비밀번호가 맞지 않아요. 처음부터 다시 확인해 주세요.");
      return;
    }
    if (result === "bad-code") {
      setStep("code");
      setError("인증번호가 맞지 않아요. 인증번호부터 다시 확인해 주세요.");
      return;
    }
    setError("로그인 상태를 확인할 수 없어요.");
  }

  return (
    <section className="rounded-2xl border border-rose-100 p-5">
      <h2 className="text-lg font-semibold text-slate-900">회원 탈퇴</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        거래 내역이 있으면 식별 정보를 암호화해 5년 보관한 뒤 삭제합니다. 거래가 없으면 즉시 삭제합니다.{" "}
        {needsPassword
          ? "비밀번호를 확인한 뒤 이메일 인증번호와 탈퇴 문구로 마무리합니다."
          : "소셜 계정은 비밀번호가 없어 이메일 인증번호와 탈퇴 문구로 확인합니다."}
      </p>
      <StepRail steps={steps} step={step} label="회원 탈퇴 단계" />
      {step === "password" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onConfirmPassword} aria-busy={busy}>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">비밀번호</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={busy}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              className={fieldClass}
            />
          </label>
          <PendingButton pending={pending === "password"} label="다음" busyLabel="확인 중" className={primaryButtonClass} />
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
      {step === "code" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onConfirmCode} aria-busy={busy}>
          <p className="text-sm leading-6 text-slate-600">
            <span className="font-medium text-slate-900">{email}</span>로 인증번호를 보냅니다. 테스트 번호는 {TEST_VERIFICATION_CODE}입니다.
          </p>
          <PendingButton
            type="button"
            pending={pending === "send"}
            disabled={busy && pending !== "send"}
            label={sent ? "인증번호 다시 받기" : "인증번호 발송"}
            busyLabel="발송 중"
            className={ghostButtonClass}
            onClick={onSendCode}
          />
          {sent ? <p role="status" className="text-xs text-slate-500">인증번호를 보냈습니다. 아래에 입력해 주세요.</p> : null}
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">인증번호</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              disabled={!sent || busy}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                setError(null);
              }}
              placeholder="4~6자리"
              className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
            />
          </label>
          <div className="flex gap-2">
            {needsPassword ? (
              <button type="button" disabled={busy} onClick={() => { setError(null); setStep("password"); }} className={ghostButtonClass}>이전</button>
            ) : null}
            <PendingButton
              pending={pending === "code"}
              disabled={!sent || code.trim().length < 4 || (busy && pending !== "code")}
              label="다음"
              busyLabel="확인 중"
              className={`${primaryButtonClass} flex-1`}
            />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
      {step === "phrase" ? (
        <form className="mt-4 grid max-w-md gap-3" onSubmit={onLeave} aria-busy={busy}>
          <label className="block space-y-2">
            <span className="text-xs text-slate-500">탈퇴 확인</span>
            <input
              value={phrase}
              disabled={busy}
              onChange={(event) => {
                setPhrase(event.target.value);
                setError(null);
              }}
              placeholder={WITHDRAW_PHRASE}
              aria-invalid={phraseError ? true : undefined}
              className={`${fieldClass} ${phraseError ? "border-rose-300" : ""}`}
            />
            <span className={`text-xs ${phraseError ? "text-rose-600" : "text-slate-400"}`}>
              {phraseError ?? `계속하려면 ${WITHDRAW_PHRASE} 를 직접 입력해 주세요.`}
            </span>
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => { setError(null); setStep("code"); }} className={ghostButtonClass}>이전</button>
            <PendingButton
              pending={pending === "leave"}
              disabled={!phraseReady || (busy && pending !== "leave")}
              label="탈퇴"
              busyLabel="탈퇴 중"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-rose-200"
            />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
