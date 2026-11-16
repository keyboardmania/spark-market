"use client";

export const GRID_PAGE_SIZE = 25;

export function GridPager({
  page,
  pageCount,
  total,
  onPage,
  label = "판매 상품 페이지",
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
  label?: string;
}) {
  const safeCount = Math.max(pageCount, 1);
  const safePage = Math.min(Math.max(page, 1), safeCount);
  const start = total === 0 ? 0 : (safePage - 1) * GRID_PAGE_SIZE + 1;
  const end = Math.min(safePage * GRID_PAGE_SIZE, total);

  return (
    <nav className="mt-8 flex flex-col items-center gap-3" aria-label={label}>
      <p className="text-xs text-slate-400">
        {start}–{end} / {total} · 한 페이지 25개 (5×5)
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPage(safePage - 1)}
          disabled={safePage <= 1}
          className="rounded-full px-3 py-2 text-sm text-slate-600 disabled:text-slate-300"
        >
          이전
        </button>
        {pageList(safePage, safeCount).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1 text-sm text-slate-300" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === safePage ? "page" : undefined}
              onClick={() => onPage(item)}
              className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm tabular-nums ${item === safePage ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(safePage + 1)}
          disabled={safePage >= safeCount}
          className="rounded-full px-3 py-2 text-sm text-slate-600 disabled:text-slate-300"
        >
          다음
        </button>
      </div>
    </nav>
  );
}

function pageList(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item >= 1 && item <= pageCount).sort((a, b) => a - b);
  const list: Array<number | "gap"> = [];
  sorted.forEach((item, index) => {
    const previous = sorted[index - 1];
    if (previous && item - previous > 1) list.push("gap");
    list.push(item);
  });
  return list;
}
