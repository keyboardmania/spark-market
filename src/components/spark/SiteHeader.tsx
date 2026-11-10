"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ROUTES, categoryHref, formatPrice } from "@/data/mockData";
import { LOCALES, translate } from "@/i18n";
import { useSpark } from "@/components/spark/SparkProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, rooms, products, logout, locale, setLocale, notifications } = useSpark();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
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
        `${product.title} ${product.category} ${product.country ?? ""} ${product.condition}`.toLowerCase().includes(keyword),
      )
      .slice(0, 6);
  }, [products, query]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-2 overflow-x-auto">
          <Link href="/" className="flex shrink-0 items-end gap-1.5" aria-label="Spark 홈">
            <span className="mb-1.5 h-1.5 w-1.5 rounded-full bg-rose-300" />
            <span className="font-serif text-2xl font-medium leading-none tracking-[-0.04em] text-slate-900">Spark</span>
          </Link>

          <div className="relative hidden w-40 shrink-0 md:block lg:w-52">
            <SearchField id="spark-search-desktop" label={t("search")} placeholder={t("searchPlaceholder")} empty={t("empty")} query={query} onChange={setQuery} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5">
            <Link href="/sell" className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium leading-none text-slate-700 hover:bg-slate-50 lg:inline-flex">
              {t("sell")}
            </Link>
            <Link href="/support" className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium leading-none text-slate-700 hover:bg-slate-50 lg:inline-flex">
              {t("support")}
            </Link>
            <Link href="/membership" className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] font-medium leading-none text-slate-700 hover:bg-slate-50 lg:inline-flex">
              {t("membership")}
            </Link>
            <IconLink href="/mypage#alerts" label={t("notifications")} badge={notifications.length} icon="bell" />
            <IconLink href="/chat" label={t("chat")} badge={unread} />
            {user ? (
              <button type="button" onClick={signOut} className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] leading-none text-slate-500 hover:bg-slate-50 lg:inline-flex">
                {t("logout")}
              </button>
            ) : (
              <>
                <Link href="/login" className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] leading-none text-slate-600 hover:bg-slate-50 lg:inline-flex">
                  {t("login")}
                </Link>
                <Link href="/signup" className="hidden whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1.5 text-[13px] font-medium leading-none text-white hover:bg-slate-700 lg:inline-flex">
                  {t("signup")}
                </Link>
              </>
            )}
            <label className="hidden shrink-0 items-center text-xs text-slate-400 lg:inline-flex">
              <span className="sr-only">{t("language")}</span>
              <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} className="rounded-full bg-transparent px-1.5 py-1.5 text-[13px] text-slate-700">
                {LOCALES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <Link href="/mypage" className="hidden whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] leading-none text-slate-700 hover:bg-slate-50 lg:inline-flex">
              {t("mypage")}
            </Link>
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={t("menu")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        <div className="pb-2 md:hidden">
          <SearchField id="spark-search-mobile" label={t("search")} placeholder={t("searchPlaceholder")} empty={t("empty")} query={query} onChange={setQuery} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto pb-2.5" aria-label="카테고리">
          {CATEGORY_ROUTES.map((route) => {
            const href = categoryHref(route.label);
            const active = pathname === href;
            return (
              <Link
                key={route.slug}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] leading-none ${active ? "bg-slate-900 font-semibold text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
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
            <label className="px-3 py-2 text-sm text-slate-500">
              {t("language")}
              <select value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} className="ml-2 rounded-full bg-slate-50 px-2 py-1">
                {LOCALES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <MenuLink href="/sell">{t("sell")}</MenuLink>
            <MenuLink href="/support">{t("support")}</MenuLink>
            <MenuLink href="/membership">{t("membership")}</MenuLink>
            <MenuLink href="/orders">{t("orders")}</MenuLink>
            <MenuLink href="/chat">{t("chat")}</MenuLink>
            <MenuLink href="/mypage">{t("mypage")}</MenuLink>
            {user ? (
              <button type="button" onClick={signOut} className="rounded-xl px-3 py-3 text-left text-sm text-slate-500">
                {t("logout")}
              </button>
            ) : (
              <>
                <MenuLink href="/login">{t("login")}</MenuLink>
                <MenuLink href="/signup">{t("signup")}</MenuLink>
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
  label,
  placeholder,
  empty,
  query,
  onChange,
  results,
  onSelect,
}: {
  id: string;
  label: string;
  placeholder: string;
  empty: string;
  query: string;
  onChange: (value: string) => void;
  results: { id: string; title: string; category: string; price: number }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-slate-400"
      />
      {query.trim() ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-slate-400">{empty}</p>
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
                      <span className="block text-[11px] text-slate-400">{product.category}</span>
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

function IconLink({ href, label, badge, icon = "chat" }: { href: string; label: string; badge: number; icon?: "chat" | "bell" }) {
  return (
    <Link href={href} aria-label={badge > 0 ? `${label} ${badge}` : label} className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-50">
      {icon === "bell" ? <BellIcon /> : <ChatIcon />}
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

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path d="M6 16h12l-1.2-2.2V10a4.8 4.8 0 0 0-9.6 0v3.8L6 16Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" />
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
