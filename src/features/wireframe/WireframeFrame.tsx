import type { ReactNode } from "react";
import Link from "next/link";

export function WireframeFrame({
  eyebrow,
  title,
  lede,
  backHref,
  backLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">{eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {lede ? <p className="text-sm leading-6 text-slate-500">{lede}</p> : null}
        {backHref ? (
          <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-900">
            {backLabel ?? "목록"}
          </Link>
        ) : null}
      </header>
      {children}
    </div>
  );
}
