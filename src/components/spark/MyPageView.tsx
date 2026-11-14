"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { SparkVipBadge } from "@/components/spark/Badges";
import { ProductCard } from "@/components/spark/ProductCard";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { SANCTIONS, type SparkUser } from "@/data/mockData";

const TRADE_LINKS = [
  { href: "/orders", label: "거래 내역", hint: "구매와 판매 상태" },
  { href: "/selling", label: "판매 관리", hint: "등록한 상품" },
  { href: "/mypage/wishlist", label: "찜한 상품", hint: "관심 매물" },
  { href: "/mypage/reviews", label: "내 리뷰", hint: "작성한 후기" },
  { href: "/chat", label: "1:1 채팅", hint: "거래 대화" },
] as const;

const SETTING_LINKS = [
  { href: "/mypage/profile", label: "프로필", hint: "사진과 닉네임" },
  { href: "/mypage/addresses", label: "배송지 관리", hint: "받는 주소" },
  { href: "/mypage/accounts", label: "계좌 관리", hint: "정산 계좌" },
  { href: "/mypage/notifications", label: "알림", hint: "수신 설정과 알림함" },
  { href: "/mypage/password", label: "비밀번호", hint: "인증 후 변경" },
  { href: "/mypage/sanctions", label: "제재 내역", hint: "상점 제한" },
  { href: "/membership", label: "멤버십", hint: "Spark VIP" },
  { href: "/mypage/withdraw", label: "회원 탈퇴", hint: "계정 삭제" },
] as const;

export function MyPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/mypage" className="text-sm text-slate-500 hover:text-slate-900">마이페이지</Link>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function MyPageView() {
  const router = useRouter();
  const mounted = useMounted();
  const { user, logout, wishlistIds, orders } = useSpark();
  const purchaseCount = mounted ? orders.filter((order) => order.role === "purchase").length : 0;
  const saleCount = mounted ? orders.filter((order) => order.role === "sale").length : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <section className="rounded-2xl bg-slate-50/80 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={mounted && user ? user.name : "S"} photoUrl={mounted ? user?.photoUrl : undefined} />
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.22em] text-slate-400">MY</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
              {mounted && user ? user.name : "마이페이지"}
            </h1>
            <p className="mt-1 truncate text-sm text-slate-500">
              {mounted && user ? `${user.email} · ${providerLabel(user.provider)}` : "로그인하면 거래와 설정이 이 계정에 모여요."}
            </p>
          </div>
        </div>
        {mounted && user?.membership === "vip" ? (
          <div className="mt-4">
            <SparkVipBadge />
          </div>
        ) : null}
        <dl className="mt-5 grid grid-cols-3 gap-2">
          <Stat label="찜" value={mounted ? String(wishlistIds.length) : "0"} />
          <Stat label="구매" value={String(purchaseCount)} />
          <Stat label="판매" value={String(saleCount)} />
        </dl>
        <div className="mt-4">
          {mounted && user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className={ghostButtonClass}
            >
              로그아웃
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link href="/login" className={ghostButtonClass}>로그인</Link>
              <Link href="/signup" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white">회원가입</Link>
            </div>
          )}
        </div>
      </section>

      <MenuGroup title="거래" items={TRADE_LINKS} />
      <MenuGroup title="설정" items={SETTING_LINKS} />
    </div>
  );
}

export function WishlistPanel() {
  const mounted = useMounted();
  const { wishlistIds, products } = useSpark();
  const wished = mounted ? products.filter((product) => wishlistIds.includes(product.id)) : [];

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">찜한 상품</h2>
      {wished.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">아직 찜한 상품이 없어요.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-4">
          {wished.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SanctionsPanel() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">내 상점 제재내역</h2>
      {SANCTIONS.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">제재 내역이 없어요.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {SANCTIONS.map((item) => (
            <li key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4 text-sm leading-6 text-slate-600">
              <p>제한일시 {item.limitedAt}</p>
              <p>해제일시 {item.releasedAt}</p>
              <p>제한기간 {item.period}</p>
              <p>제한사유 {item.reason}</p>
              <p>위반유형 {item.violation}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MenuGroup({ title, items }: { title: string; items: readonly { href: string; label: string; hint: string }[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-medium text-slate-400">{title}</h2>
      <ul className="mt-2 overflow-hidden rounded-2xl border border-slate-200">
        {items.map((item) => (
          <li key={item.href} className="border-b border-slate-100 last:border-b-0">
            <Link href={item.href} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50">
              <span>
                <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                <span className="mt-0.5 block text-xs text-slate-400">{item.hint}</span>
              </span>
              <span className="text-slate-300" aria-hidden>›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
  if (photoUrl) return <img src={photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />;
  return (
    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-900 text-lg font-medium text-white">
      {name.slice(0, 1)}
    </span>
  );
}

function providerLabel(provider: SparkUser["provider"]) {
  if (provider === "line") return "LINE";
  if (provider === "google") return "Google";
  if (provider === "x") return "X";
  if (provider === "apple") return "Apple";
  return "이메일";
}
