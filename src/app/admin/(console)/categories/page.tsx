import type { Metadata } from "next";
import { CategoriesAdmin } from "@/components/spark/admin/CategoriesAdmin";

export const metadata: Metadata = { title: "카테고리 관리" };

export default function AdminCategoriesPage() {
  return <CategoriesAdmin />;
}
