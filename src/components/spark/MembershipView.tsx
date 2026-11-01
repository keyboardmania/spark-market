"use client";

import Link from "next/link";
import { useState } from "react";
import { SparkVipBadge } from "@/components/spark/Badges";
import { ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const PLANS = [
  { id: "monthly", name: "월간", price: 9, cadence: "매월", note: "수수료 6%가 바로 적용됩니다." },
  { id: "yearly", name: "연간", price: 79, cadence: "매년", note: "월 $6.58, 수수료 6%가 1년 유지됩니다." },
] as const;

const METHODS = ["신용/체크카드", "PayPal", "Apple Pay", "Google Pay"] as const;

type PlanId = (typeof PLANS)[number]["id"];
type Method = (typeof METHODS)[number];

function formatUsd(amount: number) {
  return `$${amount}`;
}

export function MembershipView() {
  const mounted = useMounted();
  const { user, notify, activateMembership } = useSpark();
  const signedIn = mounted && Boolean(user);
  const isMember = mounted && user?.membership === "vip";
  const [planId, setPlanId] = useState<PlanId | "">("");
  const [method, setMethod] = useState<Method | "">("");
  const [terms, setTerms] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = PLANS.find((item) => item.id === planId);
  const canPay = signedIn && !isMember && Boolean(plan) && Boolean(method) && terms;

  function pay() {
    if (!signedIn) {
      setError("로그인 후 멤버십에 가입할 수 있어요.");
      return;
    }
    if (!plan || !method || !terms) {
      setError("구독 플랜, 안전결제 수단, 결제 약관을 확인해 주세요.");
      return;
    }
    if (!activateMembership()) {
      setError("멤버십 회원으로 전환하지 못했습니다. 다시 로그인해 주세요.");
      return;
    }
    setError(null);
    setDone(true);
    notify("Spark VIP 멤버십이 시작되었어요.");
  }

  if (done || isMember) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-400">{done ? "PAID" : "VIP"}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {done ? "결제가 완료되었어요" : "이미 Spark VIP 회원이에요"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {done ? "멤버십 회원으로 전환되었습니다." : "이 계정은 멤버십 회원입니다."} 거래 중개 수수료는 10%에서 6%로 감면됩니다.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <SparkVipBadge />
          <span className="text-sm text-slate-600">멤버십 회원</span>
        </div>
        {done && plan && method ? (
          <p className="mt-4 text-sm text-slate-500">
            {plan.name} {formatUsd(plan.price)} · {method} · USD ($)
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/mypage" className={primaryButtonClass}>마이페이지에서 뱃지 보기</Link>
          <Link href="/" className={ghostButtonClass}>홈으로</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl bg-slate-900 p-6 text-white lg:sticky lg:top-28">
        <p className="text-[11px] tracking-[0.22em] text-slate-400">SPARK VIP</p>
        <h1 className="mt-3 font-serif text-4xl italic text-white">수수료를 낮추는 멤버십</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">거래 중개 수수료가 10%에서 6%로 감면됩니다.</p>
        <div className="mt-8">
          <p className="text-xs text-slate-400">거래 중개 수수료</p>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-3xl text-slate-500 line-through decoration-rose-300">10%</p>
            <p aria-hidden className="pb-1 text-xl text-amber-200">→</p>
            <p className="text-6xl font-semibold tracking-tight">6%</p>
          </div>
        </div>
        <ul className="mt-8 space-y-2 text-sm leading-6 text-slate-300">
          <li>안전결제로 성사된 거래마다 중개 수수료 6%가 적용됩니다.</li>
          <li>결제 완료 즉시 멤버십 회원이 되고, 마이페이지에 Spark VIP 뱃지가 표시됩니다.</li>
        </ul>
        <p className="mt-8 text-xs text-slate-400">통화 단위는 USD ($)로 고정됩니다.</p>
      </aside>

      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          pay();
        }}
      >
        <section>
          <h2 className="text-lg font-semibold text-slate-900">구독 플랜</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PLANS.map((item) => (
              <label
                key={item.id}
                className={`cursor-pointer rounded-2xl border px-4 py-4 ${planId === item.id ? "border-slate-900" : "border-slate-200"}`}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <input
                      type="radio"
                      name="plan"
                      checked={planId === item.id}
                      onChange={() => setPlanId(item.id)}
                    />
                    {item.name}
                    {item.id === "yearly" ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">추천</span> : null}
                  </span>
                  <span className="text-right">
                    <span className="block text-lg font-semibold tabular-nums text-slate-900">{formatUsd(item.price)}</span>
                    <span className="block text-[11px] text-slate-400">USD ($) · {item.cadence}</span>
                  </span>
                </span>
                <span className="mt-3 block text-xs leading-5 text-slate-500">{item.note}</span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">안전결제</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {METHODS.map((item) => (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === item ? "border-slate-900" : "border-slate-200"}`}
              >
                <input type="radio" name="method" checked={method === item} onChange={() => setMethod(item)} />
                {item}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">결제 약관</h2>
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              <span className="mr-1 text-rose-500">필수</span>
              결제 약관에 동의합니다.{" "}
              <Link href="/legal/terms" className="text-slate-400 underline">
                보기
              </Link>
            </span>
          </label>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            구독 요금은 USD ($)로만 결제됩니다. 결제 완료 즉시 거래 중개 수수료가 10%에서 6%로 감면됩니다.
          </p>
        </section>

        {mounted && !signedIn ? (
          <p className="text-sm text-slate-600">
            이 계정에 멤버십을 적용하려면 먼저 <Link href="/login" className="font-medium text-slate-900 underline">로그인</Link>해 주세요.
          </p>
        ) : null}
        {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={!canPay} className={`${primaryButtonClass} w-full sm:w-auto`}>
            {plan ? `${formatUsd(plan.price)} 결제하기` : "결제하기"}
          </button>
          <p className="text-xs text-slate-400">통화 USD ($)</p>
        </div>
      </form>
    </div>
  );
}
