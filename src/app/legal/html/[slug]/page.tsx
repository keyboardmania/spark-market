import type { Metadata } from "next";
import Link from "next/link";
import { TERMS_VERSIONS } from "@/data/mockData";

export const metadata: Metadata = { title: "약관" };

export default async function LegalHtmlPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = TERMS_VERSIONS.find((item) => item.slug === slug) ?? null;

  if (!term) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-sm text-slate-500">약관을 찾을 수 없어요.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-slate-900 underline">
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">LEGAL</p>
      <h1 className="mt-2 font-serif text-3xl tracking-tight text-slate-900">{term.title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        버전 {term.version} · {term.author} · {term.createdAt}
      </p>
      <article
        className="prose prose-slate mt-8 max-w-none text-sm leading-7 text-slate-700 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:my-1 [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: term.body }}
      />
    </div>
  );
}
