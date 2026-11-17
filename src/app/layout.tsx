import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { AppShell } from "@/components/spark/AppShell";
import { SparkProvider } from "@/components/spark/SparkProvider";
import { LOCALES, type LocaleId } from "@/i18n";
import "./globals.css";

const DEFAULT_LOCALE: LocaleId = "ko";
const LOCALE_COOKIE = "spark-locale";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Spark",
    template: "%s · Spark",
  },
  description: "취향과 수집품이 머무는 프리미엄 C2C 플랫폼 Spark",
};

function isLocaleId(value: string | undefined): value is LocaleId {
  return LOCALES.some((item) => item.id === value);
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        <Suspense fallback={<RootFallback />}>
          <RootContent>{children}</RootContent>
        </Suspense>
      </body>
    </html>
  );
}

function RootFallback() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <div className="h-[108px] border-b border-slate-100 bg-white" />
      <main className="flex-1" />
    </div>
  );
}

async function RootContent({ children }: { children: ReactNode }) {
  await connection();
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocaleId(saved) ? saved : DEFAULT_LOCALE;

  return (
    <SparkProvider initialLocale={locale}>
      <AppShell>{children}</AppShell>
    </SparkProvider>
  );
}
