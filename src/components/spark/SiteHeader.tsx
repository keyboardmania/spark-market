"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ROUTES, categoryHref, formatPrice } from "@/data/mockData";
import { useSpark } from "@/components/spark/SparkProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, cartIds, rooms, products, logout } = useSpark();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = rooms.reduce((sum, room) => sum + room.unread, 0);

  useEffect(() => {
    setMenuOpen(false);
    setQuery("");
  }, [pathname]);

  function signOut() {
    logout();
    router.push("/");
  }

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return products
      .filter((product) =>
        `${product.title} ${product.ip} ${product.category} ${product.condition}`.toLowerCase().includes(keyword),
      )
      .slice(0, 6);
  }, [products, query]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex shrink-0 items-end gap-1.5" aria-label="Spark 홈">
            <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-rose-300" />
            <span className="font-serif text-[1.7rem] font-medium leading-none tracking-[-0.04em] text-slate-900">Spark</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="카테고리">
            {CATEGORY_ROUTES.map((route) => {
              const href = categoryHref(route.label);
              const active = pathname === href;
              return (
                <Link
                  key={route.slug}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-sm transition ${active ? "font-semibold text-slate-900" : "text-slate-400 hover:text-slate-800"}`}
                >
                  {route.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative ml-auto hidden min-w-0 flex-1 md:ml-6 md:block md:max-w-xs lg:max-w-sm">
            <SearchField id="spark-search-desktop" query={query} onChange={setQuery} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
          </div>

          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <Link href="/sell" className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:inline-flex">
              판매하기
            </Link>
            <Link href="/membership" className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:inline-flex">
              멤버십
            </Link>
            <IconLink href="/chat" label="채팅" badge={unread} />
            <IconLink href="/cart" label="장바구니" badge={cartIds.length} icon="cart" />
            {user ? (
              <button type="button" onClick={signOut} className="hidden rounded-full px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 lg:inline-flex">
                로그아웃
              </button>
            ) : (
              <>
                <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 lg:inline-flex">
                  로그인
                </Link>
                <Link href="/signup" className="hidden rounded-full bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-700 lg:inline-flex">
                  회원가입
                </Link>
              </>
            )}
            <Link href="/mypage" className="hidden rounded-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 lg:inline-flex">
              마이페이지
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-expanded={menuOpen}
              aria-label="메뉴"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <SearchField id="spark-search-mobile" query={query} onChange={setQuery} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
        </div>

        <nav className="flex gap-2 overflow-x-auto lg:hidden" aria-label="카테고리">
          {CATEGORY_ROUTES.map((route) => {
            const href = categoryHref(route.label);
            const active = pathname === href;
            return (
              <Link
                key={route.slug}
                href={href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            <MenuLink href="/sell">판매하기</MenuLink>
            <MenuLink href="/membership">멤버십</MenuLink>
            <MenuLink href="/orders">구매/판매 내역</MenuLink>
            <MenuLink href="/chat">1:1 채팅</MenuLink>
            <MenuLink href="/cart">장바구니</MenuLink>
            <MenuLink href="/mypage">마이페이지</MenuLink>
            {user ? (
              <button type="button" onClick={signOut} className="rounded-xl px-3 py-3 text-left text-sm text-slate-500">
                로그아웃
              </button>
            ) : (
              <>
                <MenuLink href="/login">로그인</MenuLink>
                <MenuLink href="/signup">회원가입</MenuLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function SearchField({
  id,
  query,
  onChange,
  results,
  onSelect,
}: {
  id: string;
  query: string;
  onChange: (value: string) => void;
  results: { id: string; title: string; ip: string; price: number }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        상품 검색
      </label>
      <input
        id={id}
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="하이큐, 치이카와, PSA10"
        className="w-full rounded-full bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-slate-400"
      />
      {query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-400">찾는 매물이 없어요.</p>
          ) : (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(product.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <span>
                      <span className="block text-[11px] text-slate-400">{product.ip}</span>
                      <span className="block text-sm text-slate-800">{product.title}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-slate-500">{formatPrice(product.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function IconLink({ href, label, badge, icon = "chat" }: { href: string; label: string; badge: number; icon?: "chat" | "cart" }) {
  return (
    <Link href={href} aria-label={badge > 0 ? `${label} ${badge}개` : label} className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-50">
      {icon === "cart" ? <CartIcon /> : <ChatIcon />}
      {badge > 0 ? (
        <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-400 px-1 text-[10px] font-medium leading-4 text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function MenuLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 16.5 4 19V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v6A2.5 2.5 0 0 1 17.5 16H6Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 7h15l-1.5 8.5H8L6 7Zm0 0L5 4H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="19" r="1.2" fill="currentColor" />
      <circle cx="17" cy="19" r="1.2" fill="currentColor" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
