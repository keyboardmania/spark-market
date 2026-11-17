"use client";

import { useEffect, useMemo, useState } from "react";
import { settlementOf } from "@/data/mockData";
import { useSpark } from "@/components/spark/SparkProvider";

export function useSellerPayout(roomId: string) {
  const { rooms, products, addresses, banks, user, decidePurchase, tradeRole } = useSpark();
  const room = rooms.find((item) => item.id === roomId) ?? null;
  const product = room ? products.find((item) => item.id === room.productId) ?? null : null;
  const isSeller = tradeRole === "seller";
  const defaultAddress = addresses.find((item) => item.isDefault)?.id ?? addresses[0]?.id ?? "";
  const defaultAccount = banks.find((item) => item.isDefault)?.id ?? banks[0]?.id ?? "";
  const [addressId, setAddressId] = useState(defaultAddress);
  const [accountId, setAccountId] = useState(defaultAccount);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!addressId && defaultAddress) setAddressId(defaultAddress);
  }, [addressId, defaultAddress]);

  useEffect(() => {
    if (!accountId && defaultAccount) setAccountId(defaultAccount);
  }, [accountId, defaultAccount]);

  const payout = useMemo(
    () => (product ? settlementOf(product.price, user?.membership === "vip" && isSeller) : null),
    [isSeller, product, user?.membership],
  );

  function confirm() {
    if (!isSeller || !addressId || !accountId) return null;
    const linked = decidePurchase(roomId, true, { addressId, accountId });
    if (!linked) return null;
    setSaved(true);
    return linked;
  }

  return {
    room,
    product,
    isSeller,
    addresses,
    banks,
    addressId,
    accountId,
    setAddressId,
    setAccountId,
    payout,
    saved,
    confirm,
  };
}
