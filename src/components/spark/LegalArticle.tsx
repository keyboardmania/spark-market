export function LegalArticle({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] tracking-[0.22em] text-slate-400">SPARK</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
