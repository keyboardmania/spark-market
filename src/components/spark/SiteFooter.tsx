"use client";

import Link from "next/link";
import { CATEGORY_ROUTES, categoryHref } from "@/data/mockData";
import { translate } from "@/i18n";
import { useSpark } from "@/components/spark/SparkProvider";

export function SiteFooter() {
  const { locale } = useSpark();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <footer className="mt-16 border-t border-slate-100 bg-slate-50/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl tracking-[-0.04em] text-slate-900">Spark</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
            취향과 수집품이 머무는 프리미엄 C2C.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400">{t("sell")}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {CATEGORY_ROUTES.map((route) => (
              <li key={route.slug}>
                <Link href={categoryHref(route.label)} className="hover:text-slate-900">
                  {route.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sell" className="hover:text-slate-900">
                {t("sell")}
              </Link>
            </li>
            <li>
              <Link href="/prohibited" className="hover:text-slate-900">
                {t("prohibited")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400">{t("guide")}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/legal/terms" className="hover:text-slate-900">
                {t("terms")}
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-slate-900">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/legal/youth" className="hover:text-slate-900">
                {t("youth")}
              </Link>
            </li>
            <li>
              <Link href="/membership" className="hover:text-slate-900">
                Spark VIP
              </Link>
            </li>
            <li>
              <Link href="/orders" className="hover:text-slate-900">
                {t("orders")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400">{t("help")}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/support" className="hover:text-slate-900">고객센터</Link></li>
            <li><Link href="/support/boards/board-faq" className="hover:text-slate-900">FAQ</Link></li>
            <li><Link href="/support/boards/board-notice" className="hover:text-slate-900">공지사항</Link></li>
            <li><Link href="/support/boards/board-inquiry" className="hover:text-slate-900">문의하기</Link></li>
            <li><Link href="/support/boards/board-event" className="hover:text-slate-900">이벤트</Link></li>
          </ul>
          <p className="mt-3 text-sm font-medium text-slate-800">1588-0427</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            평일 10:00–18:00
            <br />
            help@spark.market
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-xs leading-5 text-slate-400 sm:px-6">
          <p>주식회사 스파크랩 · 대표 여도원 · 부산 동구 초량중로 29 한국방송통신전파진흥원 부산본부 3층</p>
          <p>사업자등록번호 123-45-67890 · 통신판매업 2026-부산동구-0123</p>
          <p>© 2026 Spark. 수집의 설렘을 환하게.</p>
        </div>
      </div>
    </footer>
  );
}
