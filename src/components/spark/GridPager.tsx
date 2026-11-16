"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export const GRID_PAGE_SIZE = 25;

export function useInfiniteGrid(total: number, resetKey: string) {
  const [batch, setBatch] = useState({ key: resetKey, shown: GRID_PAGE_SIZE });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shown = batch.key === resetKey ? batch.shown : GRID_PAGE_SIZE;
  const visibleCount = Math.min(shown, total);
  const hasMore = visibleCount < total;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setBatch((current) => {
        const base = current.key === resetKey ? current.shown : GRID_PAGE_SIZE;
        return { key: resetKey, shown: base + GRID_PAGE_SIZE };
      });
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, resetKey, visibleCount]);

  return { visibleCount, hasMore, sentinelRef };
}

export function InfiniteSentinel({
  active,
  sentinelRef,
}: {
  active: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  if (!active) return null;
  return <div ref={sentinelRef} className="h-10" aria-hidden />;
}
