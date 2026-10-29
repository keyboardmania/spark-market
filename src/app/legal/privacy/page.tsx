import type { Metadata } from "next";
import { LegalArticle } from "@/components/spark/LegalArticle";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <LegalArticle
      title="개인정보처리방침"
      paragraphs={[
        "회원가입과 결제, 배송을 위해 이메일, 연락처, 배송지를 수집합니다. 닉네임은 가입 시 자동으로 부여되며 주민등록번호는 보관하지 않습니다.",
        "채팅에 첨부한 사진과 주문 정보는 거래 종료 후 분쟁 대응에 필요한 기간 동안만 보관합니다. 마케팅 수신은 선택 동의이며 언제든 마이페이지에서 철회할 수 있습니다.",
        "이 데모는 브라우저 세션 안에서만 입력값을 다루며, 외부 서버로 개인정보를 보내지 않습니다.",
      ]}
    />
  );
}
