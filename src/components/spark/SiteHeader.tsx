"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORY_ROUTES, categoryHref, formatPrice, type AppNotification, type SparkUser } from "@/data/mockData";
import { LOCALES, translate } from "@/i18n";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, rooms, products, logout, locale, setLocale, notifications, markNotificationRead, markAllNotificationsRead, removeNotification, clearNotifications } = useSpark();
  const mounted = useMounted();
  const sessionUser = mounted ? user : null;
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const [query, setQuery] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const unread = rooms.reduce((sum, room) => sum + room.unread, 0);

  useEffect(() => {
    setMenuOpen(false);
    setNoticeOpen(false);
    setSuggesting(false);
    const keyword = pathname === "/search" ? new URLSearchParams(window.location.search).get("q") ?? "" : "";
    setQuery(keyword);
  }, [pathname]);

  function changeQuery(value: string) {
    setQuery(value);
    setSuggesting(true);
  }

  function submitSearch(value: string) {
    const keyword = value.trim();
    if (!keyword) return;
    setSuggesting(false);
    router.push(`/search?q=${encodeURIComponent(keyword)}`);
  }

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
            <SearchField id="spark-search-desktop" label={t("search")} placeholder={t("searchPlaceholder")} empty={t("empty")} query={query} suggestionsOpen={suggesting} onChange={changeQuery} onSubmit={submitSearch} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <Link href="/sell" className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-rose-500 px-3.5 py-2 text-[13px] font-semibold leading-none text-white shadow-sm hover:bg-rose-600">
              {t("sell")}
            </Link>
            <NotificationBell
              label={t("notifications")}
              open={noticeOpen}
              onOpenChange={setNoticeOpen}
              notifications={notifications}
              onRead={markNotificationRead}
              onReadAll={markAllNotificationsRead}
              onRemove={removeNotification}
              onClear={clearNotifications}
            />
            <IconLink href="/chat" label={t("chat")} badge={unread} />
            {sessionUser ? (
              <ProfileMenu key={pathname} user={sessionUser} onSignOut={signOut} labels={{ mypage: t("mypage"), orders: t("orders"), logout: t("logout") }} />
            ) : (
              <>
                <Link href="/login" className="inline-flex whitespace-nowrap rounded-full px-2 py-1.5 text-[13px] leading-none text-slate-600 hover:bg-slate-50">
                  {t("login")}
                </Link>
                <Link href="/signup" className="inline-flex whitespace-nowrap rounded-full bg-slate-900 px-2.5 py-1.5 text-[13px] font-medium leading-none text-white hover:bg-slate-700">
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
          <SearchField id="spark-search-mobile" label={t("search")} placeholder={t("searchPlaceholder")} empty={t("empty")} query={query} suggestionsOpen={suggesting} onChange={changeQuery} onSubmit={submitSearch} results={results} onSelect={(id) => router.push(`/products/${id}`)} />
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
            <MenuLink href="/orders">{t("orders")}</MenuLink>
            <MenuLink href="/chat">{t("chat")}</MenuLink>
            <MenuLink href="/mypage">{t("mypage")}</MenuLink>
            {sessionUser ? (
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
  suggestionsOpen,
  onChange,
  onSubmit,
  results,
  onSelect,
}: {
  id: string;
  label: string;
  placeholder: string;
  empty: string;
  query: string;
  suggestionsOpen: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  results: { id: string; title: string; category: string; price: number }[];
  onSelect: (id: string) => void;
}) {
  return (
    <form
      role="search"
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        const field = event.currentTarget.querySelector("input");
        onSubmit(field?.value ?? query);
        field?.blur();
      }}
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full bg-slate-50 py-2.5 pl-4 pr-11 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-slate-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      <button
        type="submit"
        aria-label={label}
        className="absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-500 hover:bg-white hover:text-slate-900"
      >
        <SearchIcon />
      </button>
      {suggestionsOpen && query.trim() ? (
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
    </form>
  );
}

function ProfileMenu({
  user,
  onSignOut,
  labels,
}: {
  user: SparkUser;
  onSignOut: () => void;
  labels: { mypage: string; orders: string; logout: string };
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 12 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ top: rect.bottom + 8, right: Math.max(12, window.innerWidth - rect.right) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-50 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl"
      style={{ top: pos.top, right: pos.right }}
    >
      <p className="truncate px-4 py-2 text-xs text-slate-400">{user.email}</p>
      <ProfileLink href="/mypage" onPick={() => setOpen(false)}>{labels.mypage}</ProfileLink>
      <ProfileLink href="/orders" onPick={() => setOpen(false)}>{labels.orders}</ProfileLink>
      <ProfileLink href="/selling" onPick={() => setOpen(false)}>판매 관리</ProfileLink>
      <ProfileLink href="/mypage/wishlist" onPick={() => setOpen(false)}>찜한 상품</ProfileLink>
      <ProfileLink href="/chat" onPick={() => setOpen(false)}>채팅</ProfileLink>
      <ProfileLink href="/support" onPick={() => setOpen(false)}>고객센터</ProfileLink>
      <button type="button" role="menuitem" onClick={onSignOut} className="block w-full px-4 py-2.5 text-left text-sm text-slate-500 hover:bg-slate-50">
        {labels.logout}
      </button>
    </div>
  ) : null;

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50"
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-medium text-white">{user.name.slice(0, 1)}</span>
        )}
        <span className="hidden max-w-24 truncate text-[13px] font-medium text-slate-800 sm:inline">{user.name}</span>
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}

function ProfileLink({ href, onPick, children }: { href: string; onPick: () => void; children: string }) {
  return (
    <Link href={href} role="menuitem" onClick={onPick} className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50">
      {children}
    </Link>
  );
}

function IconLink({ href, label, badge }: { href: string; label: string; badge: number }) {
  return (
    <Link href={href} aria-label={badge > 0 ? `${label} ${badge}` : label} className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-50">
      <ChatIcon />
      {badge > 0 ? (
        <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-medium leading-4 text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function NotificationBell({
  label,
  open,
  onOpenChange,
  notifications,
  onRead,
  onReadAll,
  onRemove,
  onClear,
}: {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const router = useRouter();
  const mounted = useMounted();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const unread = notifications.filter((item) => !item.isRead).length;

  useLayoutEffect(() => {
    if (!open) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(352, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    setPos({ top: rect.bottom + 8, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(352, window.innerWidth - 24);
      const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      setPos({ top: rect.bottom + 8, left });
    }
    function onPointer(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onOpenChange(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [onOpenChange, open]);

  function openItem(item: AppNotification) {
    onRead(item.id);
    onOpenChange(false);
    router.push(item.href);
  }

  const panel = open ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      className="fixed z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onReadAll} disabled={unread === 0} className="text-xs font-medium text-rose-500 disabled:text-slate-300">
            모두 읽음
          </button>
          <button type="button" onClick={onClear} disabled={notifications.length === 0} className="text-xs font-medium text-slate-500 disabled:text-slate-300">
            전체 삭제
          </button>
        </div>
      </div>
      <ul className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-slate-400">알림이 없어요.</li>
        ) : (
          notifications.map((item) => (
            <li key={item.id} className={`flex items-start ${item.isRead ? "" : "bg-rose-50/60"}`}>
              <button type="button" onClick={() => openItem(item)} className="flex min-w-0 flex-1 gap-3 px-4 py-3 text-left hover:bg-slate-50">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-rose-500"}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-medium text-slate-400">{item.kind}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{item.createdAt}</span>
                  </span>
                  <span className={`mt-1 block text-sm leading-5 ${item.isRead ? "text-slate-500" : "font-medium text-slate-900"}`}>{item.text}</span>
                </span>
              </button>
              <button
                type="button"
                aria-label="알림 삭제"
                onClick={() => onRemove(item.id)}
                className="mr-2 mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700"
              >
                <DismissIcon />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={unread > 0 ? `${label} ${unread}` : label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-50"
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-medium leading-4 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}

function MenuLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50">
      {children}
    </Link>
  );
}

function DismissIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
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
