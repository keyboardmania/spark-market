import type { Metadata } from "next";
import { SupportView } from "@/components/spark/SupportView";

export const metadata: Metadata = { title: "고객센터" };

export default function SupportPage() {
  return <SupportView />;
}
