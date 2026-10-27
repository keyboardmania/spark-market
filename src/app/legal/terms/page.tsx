import type { Metadata } from "next";
import { LegalArticle } from "@/components/spark/LegalArticle";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <LegalArticle
      title="이용약관"
      paragraphs={[
        "Spark는 수집가가 피규어, TCG, 산리오와 굿즈를 서로 사고팔 수 있도록 연결하는 C2C 플랫폼입니다. 회원은 정확한 상품 상태와 사진을 등록해야 합니다.",
        "거래 대금은 구매 확정 또는 자동 확정 시점까지 Spark 안전결제로 보관됩니다. 판매자가 상품 상태를 사실과 다르게 적은 경우 구매자는 거래 취소를 요청할 수 있습니다.",
        "욕설, 사칭, 직거래 유도로 안전결제를 우회하는 행위는 이용이 제한됩니다. 본 화면의 약관은 서비스 체험을 위한 요약이며, 실제 계약 문서로 쓰이지 않습니다.",
      ]}
    />
  );
}
