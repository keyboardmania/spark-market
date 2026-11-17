"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { findSeller, getProductById } from "@/data/mockData";
import { InfiniteSentinel, useInfiniteGrid } from "@/components/spark/GridPager";
import { ProductCard } from "@/components/spark/ProductCard";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ghostButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useShared } from "@/data/shared";
import { useI18n } from "@/features/i18n/useI18n";
import { fill } from "@/features/i18n/ui";

const SHOP_PAGE_SIZE = 5;
type ShopTab = "listings" | "sold" | "reviews";

function shopTab(value: string | null): ShopTab {
  if (value === "reviews" || value === "sold") return value;
  return "listings";
}

export function SellerProfileView({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const seller = findSeller(id);
  const { products, user } = useSpark();
  const reviews = useShared().reviews.filter((review) => review.sellerId === id && !review.deletedAt);
  const tab = shopTab(searchParams.get("tab"));
  const listings = products.filter((product) => product.sellerId === id && product.saleStatus === "판매중");
  const sold = products.filter((product) => product.sellerId === id && product.saleStatus === "판매완료");
  const listingScroll = useInfiniteGrid(listings.length, `${id}:listings`, SHOP_PAGE_SIZE);
  const soldScroll = useInfiniteGrid(sold.length, `${id}:sold`, SHOP_PAGE_SIZE);
  const reviewScroll = useInfiniteGrid(reviews.length, `${id}:reviews`, SHOP_PAGE_SIZE);
  if (!seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">회원을 찾을 수 없어요</h1>
        <Link href="/" className={`${ghostButtonClass} mt-6`}>홈으로</Link>
      </div>
    );
  }
  const isOwnShop = seller.id === "me" && Boolean(user);
  const name = isOwnShop && user ? user.name : seller.name;
  const photoUrl = isOwnShop ? user?.photoUrl : undefined;
  const average = reviews.length === 0 ? seller.rating : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const visibleListings = listings.slice(0, listingScroll.visibleCount);
  const visibleSold = sold.slice(0, soldScroll.visibleCount);
  const visibleReviews = reviews.slice(0, reviewScroll.visibleCount);

  function selectTab(next: ShopTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "listings") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    router.replace(query ? `/sellers/${id}?${query}` : `/sellers/${id}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
              {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : name.slice(0, 1)}
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{name}</h1>
              <p className="mt-2 text-sm text-slate-700">
                {fill(t("reviewSummaryCount"), { count: String(reviews.length) })}
                {" · "}
                {fill(t("reviewSummaryAverage"), { score: average.toFixed(1) })}
              </p>
            </div>
          </div>
          {isOwnShop ? (
            <Link href="/mypage/profile" className={ghostButtonClass}>
              {t("shopEditProfile")}
            </Link>
          ) : (
            <ReportButton targetType="유저" targetId={seller.id} targetLabel={name} />
          )}
        </div>
        {seller.bio ? <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">{seller.bio}</p> : null}
      </section>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label={t("myShop")}>
        {(
          [
            ["listings", t("shopListings")],
            ["sold", t("shopSold")],
            ["reviews", t("shopReviews")],
          ] as const
        ).map(([tabId, label]) => (
          <button key={tabId} type="button" role="tab" aria-selected={tab === tabId} onClick={() => selectTab(tabId)} className={`rounded-full px-4 py-2 text-sm ${tab === tabId ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" ? (
        <section className="mt-6">
          {listings.length === 0 ? (
            <p className="text-sm text-slate-400">{t("shopListingsEmpty")}</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {visibleListings.map((product) => (
                  <li key={product.id}><ProductCard product={product} /></li>
                ))}
              </ul>
              <InfiniteSentinel active={listingScroll.hasMore} sentinelRef={listingScroll.sentinelRef} />
            </>
          )}
        </section>
      ) : null}

      {tab === "sold" ? (
        <section className="mt-6">
          {sold.length === 0 ? (
            <p className="text-sm text-slate-400">{t("shopSoldEmpty")}</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {visibleSold.map((product) => (
                  <li key={product.id}><ProductCard product={product} /></li>
                ))}
              </ul>
              <InfiniteSentinel active={soldScroll.hasMore} sentinelRef={soldScroll.sentinelRef} />
            </>
          )}
        </section>
      ) : null}

      {tab === "reviews" ? (
        <section className="mt-6">
          <p className="text-sm text-slate-700">
            {fill(t("reviewSummaryCount"), { count: String(reviews.length) })}
            {" · "}
            {fill(t("reviewSummaryAverage"), { score: average.toFixed(1) })}
          </p>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{t("shopReviewsEmpty")}</p>
          ) : (
            <>
              <ul className="mt-4 flex flex-col divide-y divide-slate-100 rounded-3xl border border-slate-200">
                {visibleReviews.map((review) => {
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
              <InfiniteSentinel active={reviewScroll.hasMore} sentinelRef={reviewScroll.sentinelRef} />
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
