import type { Metadata } from "next";
import { SignupScreen } from "@/components/spark/AuthScreens";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return <SignupScreen />;
}
