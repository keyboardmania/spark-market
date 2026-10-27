import type { Metadata } from "next";
import { LoginScreen } from "@/components/spark/AuthScreens";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return <LoginScreen />;
}
