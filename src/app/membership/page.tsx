import type { Metadata } from "next";
import { MembershipView } from "@/components/spark/MembershipView";

export const metadata: Metadata = { title: "Spark VIP" };

export default function MembershipPage() {
  return <MembershipView />;
}
