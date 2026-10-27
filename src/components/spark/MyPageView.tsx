"use client";

import Link from "next/link";
import { AdultVerifyCard } from "@/components/spark/AuthScreens";
import { ProductCard } from "@/components/spark/ProductCard";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function MyPageView() {
  const mounted = useMounted();
  const { user, logout, adultVerified, wishlistIds, products, orders, cartIds } = useSpark();
  const wished = mounted ? products.filter((product) => wishlistIds.includes(product.id)) : [];
  const purchaseCount = mounted ? orders.filter((order) => order.role === "purchase").length : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl bg-slate-50/80 p-6 sm:p-8">
        <p className="text-[11px] tracking-[0.22em] text-slate-400">MY</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {mounted && user ? `${user.name}님의 Spark` : "마이페이지"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {mounted && user ? `${user.email} · ${providerLabel(user.provider)}` : "로그인하면 거래와 인증 상태가 이 화면에 모여요."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {mounted && user ? (
            <button type="button" onClick={logout} className={ghostButtonClass}>로그아웃</button>
          ) : (
            <>
              <Link href="/login" className={ghostButtonClass}>로그인</Link>
              <Link href="/signup" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">회원가입</Link>
            </>
          )}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="장바구니" value={mounted ? String(cartIds.length) : "0"} />
          <Stat label="찜" value={mounted ? String(wishlistIds.length) : "0"} />
          <Stat label="구매" value={String(purchaseCount)} />
          <Stat label="성인 인증" value={mounted && adultVerified ? "완료" : "대기"} />
        </dl>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Shortcut href="/orders" label="구매/판매 내역" />
        <Shortcut href="/chat" label="1:1 채팅" />
        <Shortcut href="/sell" label="상품 등록" />
        <Shortcut href="/cart" label="장바구니" />
      </div>

      <div className="mt-8 max-w-md">
        <AdultVerifyCard />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">찜한 상품</h2>
        {wished.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">아직 찜한 상품이 없어요.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {wished.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Shortcut({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm font-medium text-slate-800 hover:bg-slate-50">
      {label}
    </Link>
  );
}

function providerLabel(provider: "email" | "kakao" | "naver" | "apple") {
  if (provider === "kakao") return "카카오";
  if (provider === "naver") return "네이버";
  if (provider === "apple") return "Apple";
  return "이메일";
}
