import type { Metadata } from "next";
import { ForgotScreen } from "@/components/spark/ForgotScreen";

export const metadata: Metadata = { title: "비밀번호 찾기" };

export default function ForgotPage() {
  return <ForgotScreen />;
}
