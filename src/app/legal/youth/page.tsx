import type { Metadata } from "next";
import { LegalArticle } from "@/components/spark/LegalArticle";

export const metadata: Metadata = { title: "청소년보호정책" };

export default function YouthPage() {
  return (
    <LegalArticle
      title="청소년보호정책"
      paragraphs={[
        "Spark는 만 14세 미만 아동의 회원가입을 받지 않습니다. 가입 단계에서 연령 확인과, 일부 매물에 필요한 만 19세 이상 성인 인증을 진행합니다.",
        "청소년에게 부적절한 이미지나 거래 유도가 발견되면 매물을 숨기고 계정을 제한합니다. 보호자는 고객센터 help@spark.market 으로 문의할 수 있습니다.",
      ]}
    />
  );
}
