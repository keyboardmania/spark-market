"use client";

import Link from "next/link";
import { getProductById } from "@/data/mockData";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ghostButtonClass } from "@/components/spark/styles";
import { useShared } from "@/data/shared";

export function ReviewDetailView({ id }: { id: string }) {
  const review = useShared().reviews.find((item) => item.id === id);
  if (!review || review.deletedAt) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">리뷰를 찾을 수 없어요</h1>
        <Link href="/" className={`${ghostButtonClass} mt-6`}>홈으로</Link>
      </div>
    );
  }
  const product = getProductById(review.productId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-[11px] tracking-[0.22em] text-slate-400">REVIEW</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">리뷰 상세</h1>
      <article className="mt-6 rounded-3xl border border-slate-200 p-6">
        <p className="text-lg text-slate-900">{"★".repeat(review.rating)}</p>
        <p className="mt-3 text-sm leading-7 text-slate-700">{review.text}</p>
        <p className="mt-4 text-sm text-slate-500">
          작성자{" "}
          <Link href={`/sellers/${review.authorId}`} className="font-medium text-slate-900 underline-offset-4 hover:underline">
            {review.author}
          </Link>
          {" · "}
          {review.createdAt}
        </p>
        {product ? (
          <Link href={`/products/${product.id}`} className="mt-4 inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
            {product.title}
          </Link>
        ) : null}
        {review.media.length > 0 ? (
          <ul className="mt-4 flex gap-2">
            {review.media.map((media) => (
              <li key={media.id}><img src={media.url} alt={media.name} className="h-24 w-24 rounded-xl object-cover" /></li>
            ))}
          </ul>
        ) : null}
        <div className="mt-6">
          <ReportButton targetType="리뷰" targetId={review.id} targetLabel={`${review.author}의 후기 · ${review.text}`} />
        </div>
      </article>
    </div>
  );
}
