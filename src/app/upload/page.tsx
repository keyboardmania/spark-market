import type { Metadata } from "next";
import { SellForm } from "@/components/spark/SellForm";

export const metadata: Metadata = { title: "상품 등록" };

export default function UploadPage() {
  return <SellForm />;
}
