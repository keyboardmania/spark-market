"use client";

import Link from "next/link";
import { findSeller, getProductById } from "@/data/mockData";
import { ProductCard } from "@/components/spark/ProductCard";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useShared } from "@/data/shared";

export function SellerProfileView({ id }: { id: string }) {
  const seller = findSeller(id);
  const { products, user } = useSpark();
  const reviews = useShared().reviews.filter((review) => review.sellerId === id && !review.deletedAt);
  if (!seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">회원을 찾을 수 없어요</h1>
        <Link href="/" className={`${ghostButtonClass} mt-6`}>홈으로</Link>
      </div>
    );
  }
  const name = seller.id === "me" && user ? user.name : seller.name;
  const listings = products.filter((product) => product.sellerId === seller.id);
  const average = reviews.length === 0 ? seller.rating : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">{name.slice(0, 1)}</span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{name}</h1>
              <p className="mt-1 text-sm text-slate-500">{seller.handle} · {seller.city}</p>
              <p className="mt-2 text-sm text-slate-700">평점 {average.toFixed(1)} · 후기 {reviews.length} · 거래 {seller.sales}</p>
            </div>
          </div>
          <ReportButton targetType="유저" targetId={seller.id} targetLabel={name} />
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{seller.bio}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">판매 중인 상품</h2>
        {listings.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">등록한 상품이 없어요.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
            {listings.map((product) => (
              <li key={product.id}><ProductCard product={product} /></li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">받은 거래 후기</h2>
          <p className="text-sm text-slate-500">평균 {average.toFixed(1)} · {reviews.length}개</p>
        </div>
        {reviews.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">받은 거래 후기가 없어요.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100 rounded-3xl border border-slate-200">
            {reviews.map((review) => {
              const product = getProductById(review.productId);
              return (
                <li key={review.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link href={`/sellers/${review.authorId}`} className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline">
                          {review.author}
                        </Link>
                        <span className="text-sm tracking-tight text-amber-500" aria-label={`별점 ${review.rating}`}>
                          {"★".repeat(review.rating)}
                          <span className="text-slate-200">{"★".repeat(Math.max(0, 5 - review.rating))}</span>
                        </span>
                        <time className="text-xs text-slate-400">{review.createdAt}</time>
                      </div>
                      <Link href={`/reviews/${review.id}`} className="mt-2 block text-sm leading-6 text-slate-700 hover:text-slate-900">
                        {review.text}
                      </Link>
                      {product ? (
                        <Link href={`/products/${product.id}`} className="mt-1 inline-flex max-w-full truncate text-xs text-slate-500 underline-offset-4 hover:underline">
                          {product.title}
                        </Link>
                      ) : null}
                    </div>
                    <ReportButton
                      targetType="리뷰"
                      targetId={review.id}
                      targetLabel={`${review.author}의 후기 · ${review.text}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
