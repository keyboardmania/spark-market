import type { Metadata } from "next";
import { cookies } from "next/headers";
import { connection } from "next/server"; // ⬅️ 추가
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { AppShell } from "@/components/spark/AppShell";
import { SparkProvider } from "@/components/spark/SparkProvider";
import { LOCALES, type LocaleId } from "@/i18n";
import "./globals.css";


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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection(); // ⬅️ dynamic config 대신 connection()을 호출하여 동적 렌더링 명시
  const cookieStore = await cookies();
  const saved = cookieStore.get("spark-locale")?.value;
  const locale: LocaleId = LOCALES.some((item) => item.id === saved) ? (saved as LocaleId) : "ko";
  
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        <SparkProvider initialLocale={locale}>
          <AppShell>{children}</AppShell>
        </SparkProvider>
      </body>
    </html>
  );
}