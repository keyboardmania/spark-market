import { redirect } from "next/navigation";

export default async function NotificationsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  redirect(params.tab === "inbox" ? "/mypage/inbox" : "/mypage/notification-settings");
}
