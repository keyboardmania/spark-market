"use client";

import Link from "next/link";
import { primaryButtonClass } from "@/components/spark/styles";
import { AccountPicker } from "@/features/seller-payout/AccountPicker";
import { AddressPicker } from "@/features/seller-payout/AddressPicker";
import { PayoutSummary } from "@/features/seller-payout/PayoutSummary";
import { useSellerPayout } from "@/features/seller-payout/useSellerPayout";
import { WireframeFrame } from "@/features/wireframe/WireframeFrame";

export function SellerPayoutView({ roomId }: { roomId: string }) {
  const payout = useSellerPayout(roomId);

  if (!payout.room || !payout.product || !payout.payout) {
    return (
      <WireframeFrame eyebrow="PAYOUT" title="거래를 찾을 수 없어요" backHref="/chat" backLabel="채팅">
        <p className="text-sm text-slate-500">채팅방이 없거나 상품이 내려가 있습니다.</p>
      </WireframeFrame>
    );
  }

  return (
    <WireframeFrame
      eyebrow="PAYOUT"
      title="정산 정보"
      lede={payout.product.title}
      backHref={`/chat/${roomId}`}
      backLabel="채팅으로"
    >
      <div className="flex flex-col gap-6">
        <PayoutSummary product={payout.product} payout={payout.payout} />
        {payout.isSeller ? (
          <>
            <AddressPicker addresses={payout.addresses} value={payout.addressId} onChange={payout.setAddressId} />
            <AccountPicker accounts={payout.banks} value={payout.accountId} onChange={payout.setAccountId} />
            <p className="text-xs leading-5 text-slate-400">
              주소는 <Link href="/mypage#addresses" className="underline">배송지</Link>, 계좌는 <Link href="/mypage#accounts" className="underline">내 계좌</Link>에서 미리 저장합니다. 기본 항목이 있으면 여기 채워 둡니다.
            </p>
            <button
              type="button"
              className={primaryButtonClass}
              disabled={!payout.addressId || !payout.accountId}
              onClick={payout.confirm}
            >
              저장하고 구매 수락
            </button>
            {payout.saved ? <p className="text-sm text-slate-500">정산 정보를 저장하고 구매를 수락했어요.</p> : null}
          </>
        ) : (
          <p className="text-sm text-slate-500">판매자만 주소와 정산 계좌를 입력할 수 있어요.</p>
        )}
      </div>
    </WireframeFrame>
  );
}
