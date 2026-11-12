"use client";

import { useState, type FormEvent } from "react";
import { passwordIssue } from "@/components/spark/AuthScreens";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { BANK_LIMIT } from "@/data/mockData";
import { useShared } from "@/data/shared";

export function AccountPanels() {
  const {
    user,
    banks,
    addBank,
    removeBank,
    notifications,
    notifyMode,
    setNotifyMode,
    updateProfile,
    requestResetCode,
    changePassword,
    withdraw,
    retention,
  } = useSpark();
  const reviews = useShared().reviews.filter((review) => !review.deletedAt && review.author === user?.name);

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
          <section id="alerts">
            <h2 className="text-lg font-semibold text-slate-900">알림</h2>
            <label className="mt-3 block max-w-xs space-y-2">
              <span className="text-xs text-slate-500">알림 방식</span>
              <select value={notifyMode} onChange={(event) => setNotifyMode(event.target.value as typeof notifyMode)} className={fieldClass}>
                <option value="소리">소리</option>
                <option value="진동">진동</option>
                <option value="무음">무음</option>
              </select>
            </label>
            <p className="mt-2 text-xs text-slate-400">알림은 최신 50개만 남고 그보다 오래된 항목은 삭제됩니다. 무음이면 새 알림을 쌓지 않습니다.</p>
            <ul className="mt-3 space-y-2">
              {notifications.length === 0 ? <li className="text-sm text-slate-400">알림이 없어요.</li> : null}
              {notifications.map((item) => (
                <li key={item.id} className={`rounded-2xl border px-4 py-3 text-sm ${item.isRead ? "border-slate-200" : "border-rose-200 bg-rose-50/40"}`}>
                  <span className="text-xs text-slate-400">{item.kind} · {item.createdAt}{item.isRead ? "" : " · 안 읽음"}</span>
                  <p className="text-slate-800">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>
          <BankForm banks={banks} addBank={addBank} removeBank={removeBank} />
          <PasswordForm email={user.email} requestResetCode={requestResetCode} changePassword={changePassword} />
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
          <WithdrawForm provider={user.provider} withdraw={withdraw} />
        </>
      ) : null}
    </div>
  );
}

function ProfileForm() {
  const { user, updateProfile } = useSpark();
  const [name, setName] = useState(user?.name ?? "");
  if (!user) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">프로필</h2>
      <form
        className="mt-3 grid max-w-md gap-3"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          if (name.trim()) updateProfile({ name: name.trim() });
        }}
      >
        {user.photoUrl ? <img src={user.photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">프로필 사진</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") updateProfile({ photoUrl: reader.result });
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-xs text-slate-500">닉네임</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <button type="submit" className={primaryButtonClass}>프로필 저장</button>
      </form>
    </section>
  );
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
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">내 계좌</h2>
      <p className="mt-1 text-xs text-slate-400">최대 {BANK_LIMIT}개까지 저장합니다.</p>
      <ul className="mt-3 space-y-2">
        {banks.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            <span>{item.bank} · {item.holder} · {item.number}{item.isDefault ? " · 기본" : ""}</span>
            <button type="button" onClick={() => removeBank(item.id)} className="text-xs text-slate-400">삭제</button>
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
            setError(`계좌는 ${BANK_LIMIT}개까지예요.`);
            return;
          }
          setHolder("");
          setBank("");
          setNumber("");
          setError(null);
        }}
      >
        <input value={holder} onChange={(event) => setHolder(event.target.value)} placeholder="예금주" className={fieldClass} />
        <input value={bank} onChange={(event) => setBank(event.target.value)} placeholder="은행" className={fieldClass} />
        <input value={number} onChange={(event) => setNumber(event.target.value)} placeholder="계좌번호" className={fieldClass} />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
          기본 계좌
        </label>
        <button type="submit" className={ghostButtonClass}>계좌 추가</button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}

function PasswordForm({
  email,
  requestResetCode,
  changePassword,
}: {
  email: string;
  requestResetCode: (email: string) => boolean;
  changePassword: (email: string, currentPassword: string, code: string, nextPassword: string) => boolean;
}) {
  const [current, setCurrent] = useState("");
  const [code, setCode] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const issue = next ? passwordIssue(next) : null;
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">비밀번호 변경</h2>
      <form
        className="mt-3 grid max-w-md gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (issue) return;
          if (!changePassword(email, current, code.trim(), next)) {
            setError("현재 비밀번호 또는 인증번호가 맞지 않아요.");
            return;
          }
          setCurrent("");
          setCode("");
          setNext("");
          setError(null);
        }}
      >
        <input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="현재 비밀번호" className={fieldClass} />
        <button type="button" className="text-left text-sm text-slate-700 underline" onClick={() => requestResetCode(email)}>인증번호 받기</button>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="인증번호" className={fieldClass} />
        <input type="password" value={next} onChange={(event) => setNext(event.target.value)} placeholder="새 비밀번호" className={fieldClass} />
        {issue ? <p className="text-xs text-rose-600">{issue}</p> : null}
        <button type="submit" className={primaryButtonClass}>변경</button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}

function WithdrawForm({
  provider,
  withdraw,
}: {
  provider: string;
  withdraw: (password: string) => "ok" | "bad-password" | "guest";
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <section className="rounded-2xl border border-rose-100 p-5">
      <h2 className="text-lg font-semibold text-slate-900">회원 탈퇴</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        거래 내역이 있으면 식별 정보를 암호화해 5년 보관한 뒤 삭제합니다. 거래가 없으면 즉시 삭제합니다. {provider === "email" ? "현재 비밀번호로 확인합니다." : "소셜 계정은 가입 이메일을 입력해 확인합니다."}
      </p>
      <form
        className="mt-3 grid max-w-md gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const result = withdraw(password);
          if (result === "bad-password") setError(provider === "email" ? "비밀번호가 맞지 않아요." : "가입 이메일이 맞지 않아요.");
        }}
      >
        <input type={provider === "email" ? "password" : "email"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={provider === "email" ? "비밀번호" : "가입 이메일"} className={fieldClass} />
        <button type="submit" className="rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white">탈퇴</button>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>
    </section>
  );
}
