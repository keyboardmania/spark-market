import type { Metadata } from "next";
import { BOARD_POSTS } from "@/data/mockData";
import { PostDetailView } from "@/features/support/posts/PostDetailView";

export const metadata: Metadata = { title: "게시글" };
export const instant = false;

export function generateStaticParams() {
  return BOARD_POSTS.map((post) => ({ id: post.id }));
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostDetailView id={id} />;
}
