import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "판매 금지 품목" };

const ITEMS = [
  "가품, 위조품, 무단 복제 상품",
  "성인용품과 청소년에게 유해한 매체",
  "무기, 화약, 위험물",
  "의약품, 의료기기, 살아 있는 동물",
  "개인정보가 담긴 매체와 계정 양도",
  "현금화 목적의 상품권·쿠폰 재판매",
];

export default function ProhibitedPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-[11px] tracking-[0.22em] text-slate-400">POLICY</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">판매 금지 품목</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        아래 품목은 등록할 수 없습니다. 금지 품목이거나 같은 상품 신고 수락이 3회를 초과하면 상품은 삭제됩니다. 데이터는 남고 사진과 동영상은 3개월 후 삭제되며, 예약중 상품은 삭제하지 않습니다.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-slate-700">
        {ITEMS.map((item) => (
          <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
      <Link href="/sell" className="mt-8 inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
        판매 등록으로 돌아가기
      </Link>
    </div>
  );
}
