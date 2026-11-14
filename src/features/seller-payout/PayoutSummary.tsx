import { formatPrice, type Product } from "@/data/mockData";

export function PayoutSummary({
  product,
  payout,
}: {
  product: Product;
  payout: { feeRate: number; feeAmount: number; payoutAmount: number };
}) {
  return (
    <section className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
      <Amount label="상품 금액" value={formatPrice(product.price)} />
      <Amount label={`수수료 ${Math.round(payout.feeRate * 100)}%`} value={formatPrice(payout.feeAmount)} />
      <Amount label="실수령 예상" value={formatPrice(payout.payoutAmount)} />
    </section>
  );
}

function Amount({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </p>
  );
}
