import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { AppShell } from "@/components/spark/AppShell";
import { SparkProvider } from "@/components/spark/SparkProvider";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        <SparkProvider>
          <AppShell>{children}</AppShell>
        </SparkProvider>
      </body>
    </html>
  );
}
