import type { Metadata } from "next";
import { AddressBook } from "@/components/spark/AddressBook";
import { MyPageFrame } from "@/components/spark/MyPageView";

export const metadata: Metadata = { title: "배송지 관리" };

export default function AddressesPage() {
  return (
    <MyPageFrame>
      <AddressBook />
    </MyPageFrame>
  );
}
