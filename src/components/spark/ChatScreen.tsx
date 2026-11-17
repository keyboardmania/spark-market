"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPrice, getProductById, getSeller, type ChatMessage, type Product } from "@/data/mockData";
import { ConfirmDialog } from "@/components/spark/ConfirmDialog";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";
import { roomInInbox } from "@/features/chat/rooms";
import { INCOMING_SAMPLES, translateMessage } from "@/features/chat/translate";
import { useI18n } from "@/features/i18n/useI18n";
import type { UiKey } from "@/features/i18n/ui";
import { systemBody } from "@/features/i18n/systemText";
import { AccountPicker } from "@/features/seller-payout/AccountPicker";
import { AddressPicker } from "@/features/seller-payout/AddressPicker";
import { PayoutSummary } from "@/features/seller-payout/PayoutSummary";
import { useSellerPayout } from "@/features/seller-payout/useSellerPayout";

const CHAT_HEADER_CLASS = "flex items-center gap-3 border-b border-slate-100 px-4 py-3";
const CHAT_LEAVE_CLASS = "shrink-0 whitespace-nowrap text-xs font-medium text-slate-700";
const EMOJIS = ["✨", "💖", "🧸", "😊", "🙌", "🎀", "😭", "⚡"];
const CHAT_MEDIA_LIMIT = 10;
const CHAT_MEDIA_EXT = new Set(["png", "jpg", "jpeg", "mp4", "mov"]);

type PendingMedia = { id: string; name: string; kind: "image" | "video"; url: string };

function mediaKind(file: File): PendingMedia["kind"] | null {
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase() : "";
  if (!CHAT_MEDIA_EXT.has(extension)) return null;
  return extension === "mp4" || extension === "mov" ? "video" : "image";
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("read"));
    reader.readAsDataURL(file);
  });
}

export function ChatScreen({ initialRoomId }: { initialRoomId?: string }) {
  const router = useRouter();
  const mounted = useMounted();
  const { t } = useI18n();
  const { rooms, products, isProductDeleted, typingRoomId, sendMessage, markRead, leaveRoom, notify, decidePurchase, requestPurchase, setActiveChatRoomId, tradeRole } = useSpark();
  const [activeId, setActiveId] = useState<string | null>(initialRoomId ?? null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [paidFlash, setPaidFlash] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showList, setShowList] = useState(!initialRoomId);
  const [connected, setConnected] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const sampleCursor = useRef(0);
  const inbox = rooms.filter(roomInInbox);

  const active = activeId ? rooms.find((room) => room.id === activeId) ?? null : null;
  const product = active
    ? isProductDeleted(active.productId)
      ? null
      : products.find((item) => item.id === active.productId) ?? getProductById(active.productId)
    : null;
  const isSeller = tradeRole === "seller";

  useEffect(() => {
    const timer = window.setTimeout(() => setConnected(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!initialRoomId) return;
    setActiveId(initialRoomId);
    setShowList(false);
  }, [initialRoomId]);

  useEffect(() => {
    if (active?.id) markRead(active.id);
  }, [active?.id, markRead]);

  useEffect(() => {
    const roomId = active?.id ?? null;
    const media = window.matchMedia("(min-width: 768px)");
    const publish = () => {
      const threadVisible = Boolean(roomId) && (media.matches || !showList);
      setActiveChatRoomId(threadVisible ? roomId : null);
    };
    publish();
    media.addEventListener("change", publish);
    return () => {
      media.removeEventListener("change", publish);
      setActiveChatRoomId(null);
    };
  }, [active?.id, setActiveChatRoomId, showList]);

  useEffect(() => {
    if (!initialRoomId) return;
    if (window.sessionStorage.getItem("spark-return-room") !== initialRoomId) return;
    window.sessionStorage.removeItem("spark-return-room");
    setPaidFlash(true);
  }, [initialRoomId]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    thread.scrollTo({ top: thread.scrollHeight, behavior: paidFlash ? "smooth" : "auto" });
  }, [active?.messages.length, typingRoomId, active?.id, showList, paidFlash]);

  useEffect(() => {
    if (!mounted) return;
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => {
      const top = frame.getBoundingClientRect().top;
      frame.style.height = `${Math.max(420, window.innerHeight - top)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="h-[640px] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  function selectRoom(id: string) {
    setActiveId(id);
    setPending([]);
    setShowList(false);
  }

  function confirmLeave() {
    if (!active) return;
    leaveRoom(active.id);
    setLeaveOpen(false);
    setPending([]);
    setActiveId(null);
    setShowList(true);
    if (initialRoomId) router.replace("/chat");
  }

  function receiveSample() {
    if (!active) return;
    const sample = INCOMING_SAMPLES[sampleCursor.current % INCOMING_SAMPLES.length];
    sampleCursor.current += 1;
    sendMessage(active.id, { text: sample.text, originalText: sample.text, langLabel: sample.label, sender: "seller" });
  }

  function submit() {
    const text = draft.trim();
    if (!active || (!text && pending.length === 0)) return;
    if (text) sendMessage(active.id, { text, sender: "me" });
    const media = pending.map((file) => file.kind === "video"
      ? { videoUrl: file.url, text: t("chatVideo"), sender: "me" as const }
      : { imageUrl: file.url, text: t("chatSentPhoto"), sender: "me" as const });
    if (media.length > 0) sendMessage(active.id, media[0], media.slice(1));
    setPending([]);
    setDraft("");
    setEmojiOpen(false);
  }

  async function attach(list: FileList | null) {
    if (!active || !list || list.length === 0) return;
    const sent = active.messages.filter((message) => message.imageUrl || message.videoUrl).length;
    const roomLeft = CHAT_MEDIA_LIMIT - sent - pending.length;
    if (roomLeft <= 0) {
      notify(t("chatMediaLimit"));
      return;
    }
    const incoming = [...list];
    const invalid = incoming.filter((file) => !mediaKind(file));
    const valid = incoming.filter((file) => mediaKind(file));
    if (invalid.length > 0) notify(t("chatMediaType"));
    if (valid.length > roomLeft) notify(t("chatMediaLimit"));
    const accepted = valid.slice(0, roomLeft);
    if (accepted.length === 0) return;
    const loaded = await Promise.all(accepted.map(async (file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      kind: mediaKind(file) ?? "image",
      url: await readFile(file),
    })));
    setPending((current) => [...current, ...loaded].slice(0, CHAT_MEDIA_LIMIT));
  }

  return (
    <div ref={frameRef} className="mx-auto flex min-h-[420px] max-w-6xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">LIVE CHAT</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{t("chatTitle")}</h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "animate-pulse bg-amber-300"}`} />
          {connected ? t("chatConnected") : t("chatConnecting")}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${showList ? "flex" : "hidden"} min-h-0 flex-col border-slate-100 md:flex md:border-r`}>
          <p className="px-4 py-3 text-xs font-medium text-slate-400">{t("chatThreads")}</p>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {inbox.length === 0 ? <li className="px-4 py-6 text-xs leading-5 text-slate-400">{t("chatInboxEmpty")}</li> : null}
            {inbox.map((room) => {
              const selected = room.id === active?.id;
              const last = room.messages[room.messages.length - 1];
              return (
                <li key={room.id}>
                  <button
                    type="button"
                    onClick={() => selectRoom(room.id)}
                    className={`flex w-full flex-col gap-1 px-4 py-3 text-left ${selected ? "bg-slate-50" : "hover:bg-slate-50/70"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">{roomTitle(room, products, t("partyBuyer"))}</span>
                      {room.unread > 0 ? (
                        <span className="rounded-full bg-rose-400 px-1.5 text-[10px] leading-4 text-white">{room.unread}</span>
                      ) : null}
                    </span>
                    <span className="line-clamp-1 text-xs text-slate-400">{previewText(last, t)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className={`${showList ? "hidden" : "flex"} min-h-0 flex-col md:flex`}>
          {active && product ? (
            <>
              <header className={CHAT_HEADER_CLASS}>
                <button type="button" className="text-sm text-slate-400 md:hidden" onClick={() => setShowList(true)}>
                  {t("chatList")}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{roomTitle(active, products, t("partyBuyer"))}</p>
                  <p className="text-xs text-slate-400">{isSeller ? t("chatSellerRole") : t("chatBuyerRole")} · {product.sellerId === "me" ? t("chatMine") : active.sellerHandle}</p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <ReportButton
                    targetType="유저"
                    targetId={product.sellerId === "me" ? active.sellerName : getSeller(product.sellerId).name}
                    targetLabel={product.sellerId === "me" ? active.sellerName : getSeller(product.sellerId).name}
                  />
                  <button type="button" className="shrink-0 whitespace-nowrap text-xs text-slate-500" onClick={() => receiveSample()}>{t("chatSample")}</button>
                  <button type="button" className={CHAT_LEAVE_CLASS} onClick={() => setLeaveOpen(true)}>{t("chatLeave")}</button>
                </div>
              </header>
              <div className="border-b border-slate-100 px-4 py-3">
                <ProductSummary product={product} />
              </div>
              <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-4">
                {active.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    mine={message.sender === "me"}
                    enter={paidFlash && index === active.messages.length - 1}
                    footer={
                      <MessageFooter
                        message={message}
                        isSeller={isSeller}
                        status={active.purchase?.status}
                        onReject={() => decidePurchase(active.id, false)}
                        onApprove={() => setApproveOpen(true)}
                        onAccept={() => router.push(`/chat/${active.id}/pay`)}
                      />
                    }
                  />
                ))}
                {typingRoomId === active.id ? <p className="text-xs text-slate-400">{t("chatTyping")}</p> : null}
              </div>
              <form
                className="border-t border-slate-100 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                {active.activity === "종료" ? (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                  <p className="text-xs leading-5 text-slate-500">{t("chatClosed")}</p>
                  <button type="button" className={ghostButtonClass} onClick={() => setLeaveOpen(true)}>{t("chatLeaveTitle")}</button>
                </div>
              ) : (
                <TradeActions
                  buyer={!isSeller}
                  saleStatus={product.saleStatus}
                  purchaseStatus={active.purchase?.status}
                  onRequest={() => requestPurchase(active.id)}
                  onApprove={() => setApproveOpen(true)}
                  onReject={() => decidePurchase(active.id, false)}
                  onPay={() => router.push(`/chat/${active.id}/pay`)}
                />
              )}
                {emojiOpen ? (
                  <div className="mb-2 flex flex-wrap gap-1 rounded-2xl bg-slate-50 p-2">
                    {EMOJIS.map((emoji) => (
                      <button key={emoji} type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white" onClick={() => setDraft((current) => `${current}${emoji}`)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
                {pending.length > 0 ? (
                  <ul className="mb-2 flex gap-2 overflow-x-auto" aria-label={t("chatAttachLabel")}>
                    {pending.map((file) => (
                      <li key={file.id} className="relative h-16 w-16 shrink-0">
                        {file.kind === "video" ? (
                          <video src={file.url} muted className="h-16 w-16 rounded-xl bg-slate-900 object-cover" />
                        ) : (
                          <img src={file.url} alt={file.name} className="h-16 w-16 rounded-xl object-cover" />
                        )}
                        <button
                          type="button"
                          aria-label={t("chatRemoveFile")}
                          onClick={() => setPending((current) => current.filter((item) => item.id !== file.id))}
                          className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-xs text-slate-500 shadow"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" multiple accept=".png,.jpg,.jpeg,.mp4,.mov,image/png,image/jpeg,video/mp4,video/quicktime" className="sr-only" onChange={(event) => { void attach(event.target.files); event.target.value = ""; }} />
                  <button type="button" aria-label={t("chatAttachLabel")} onClick={() => fileRef.current?.click()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-xs text-slate-500">
                    {t("chatAttach")}
                  </button>
                  <button type="button" aria-label={t("chatEmojiLabel")} aria-expanded={emojiOpen} onClick={() => setEmojiOpen((open) => !open)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-sm">
                    😊
                  </button>
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t("chatPlaceholder")} className={fieldClass} />
                  <button type="submit" className="shrink-0 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                    {t("chatSend")}
                  </button>
                </div>
              </form>
              {approveOpen && isSeller && active.purchase?.status === "대기" ? (
                <ApprovePurchaseDialog roomId={active.id} onClose={() => setApproveOpen(false)} />
              ) : null}
            </>
          ) : active ? (
            <InactiveRoom
              title={roomTitle(active, products, t("partyBuyer"))}
              notice={t("chatNoProduct")}
              messages={active.messages}
              onBack={() => setShowList(true)}
              onLeave={() => setLeaveOpen(true)}
            />
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-slate-400">{t("chatPick")}</div>
          )}
          {leaveOpen && active ? (
            <ConfirmDialog
              title={t("chatLeaveTitle")}
              body={t("chatLeaveBody")}
              confirmLabel={t("chatLeaveConfirm")}
              cancelLabel={t("cancel")}
              onClose={() => setLeaveOpen(false)}
              onConfirm={confirmLeave}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function InactiveRoom({
  title,
  notice,
  messages,
  onBack,
  onLeave,
}: {
  title: string;
  notice: string;
  messages: ChatMessage[];
  onBack: () => void;
  onLeave: () => void;
}) {
  const { t } = useI18n();

  return (
    <>
      <header className={CHAT_HEADER_CLASS}>
        <button type="button" className="text-sm text-slate-400 md:hidden" onClick={onBack}>
          {t("chatList")}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="text-xs text-slate-400">{notice}</p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <button type="button" className={CHAT_LEAVE_CLASS} onClick={onLeave}>{t("chatLeave")}</button>
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-4">
        {messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.sender === "me"} />)}
      </div>
    </>
  );
}

function MessageFooter({
  message,
  isSeller,
  status,
  onReject,
  onApprove,
  onAccept,
}: {
  message: ChatMessage;
  isSeller: boolean;
  status?: string;
  onReject: () => void;
  onApprove: () => void;
  onAccept: () => void;
}) {
  const { t } = useI18n();
  if (message.kind === "purchase" && status === "대기" && isSeller) {
    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={onReject}>
          {t("chatReject")}
        </button>
        <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={onApprove}>
          {t("chatApprove")}
        </button>
      </div>
    );
  }
  if (message.kind === "purchase" && status === "대기" && !isSeller) {
    return <p className="mt-1 text-xs text-slate-400">{t("chatWaitApprove")}</p>;
  }
  if (message.kind === "payment" && status === "승인" && !isSeller) {
    return (
      <button type="button" className={`${primaryButtonClass} mt-3`} onClick={onAccept}>
        {t("chatAccept")}
      </button>
    );
  }
  return null;
}

function TradeActions({
  buyer,
  saleStatus,
  purchaseStatus,
  onRequest,
  onApprove,
  onReject,
  onPay,
}: {
  buyer: boolean;
  saleStatus: Product["saleStatus"];
  purchaseStatus?: string;
  onRequest: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPay: () => void;
}) {
  const { t } = useI18n();
  const open = purchaseStatus === "대기" || purchaseStatus === "승인" || purchaseStatus === "결제완료";
  if (buyer && saleStatus === "판매중" && !open) {
    return (
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
        <p className="text-xs leading-5 text-slate-500">{t("chatRequestHint")}</p>
        <button type="button" className={primaryButtonClass} onClick={onRequest}>{t("chatRequest")}</button>
      </div>
    );
  }
  if (buyer && purchaseStatus === "대기") {
    return <p className="mb-3 text-xs leading-5 text-slate-500">{t("chatWaitingBuyer")}</p>;
  }
  if (!buyer && purchaseStatus === "대기") {
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" className={ghostButtonClass} onClick={onReject}>{t("chatReject")}</button>
        <button type="button" className={primaryButtonClass} onClick={onApprove}>{t("chatApprove")}</button>
      </div>
    );
  }
  if (buyer && purchaseStatus === "승인") {
    return (
      <div className="mb-3">
        <button type="button" className={primaryButtonClass} onClick={onPay}>{t("chatAccept")}</button>
      </div>
    );
  }
  if (!buyer && purchaseStatus === "승인") {
    return <p className="mb-3 text-xs leading-5 text-slate-500">{t("chatPaySent")}</p>;
  }
  return null;
}

function ApprovePurchaseDialog({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const router = useRouter();
  const payout = useSellerPayout(roomId);
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="approve-purchase-title" className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-5 pt-4 pb-6 shadow-2xl sm:rounded-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <h2 id="approve-purchase-title" className="text-lg font-semibold text-slate-900">{t("chatApproveTitle")}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t("chatApproveLede")}</p>
        {payout.product && payout.payout ? (
          <div className="mt-5 flex flex-col gap-4">
            <PayoutSummary product={payout.product} payout={payout.payout} />
            <AddressPicker addresses={payout.addresses} value={payout.addressId} onChange={payout.setAddressId} />
            <AccountPicker accounts={payout.banks} value={payout.accountId} onChange={payout.setAccountId} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{t("chatNoProduct")}</p>
        )}
        <div className="mt-5 flex gap-2">
          <button type="button" className={`${ghostButtonClass} flex-1`} onClick={onClose}>{t("chatClose")}</button>
          <button
            type="button"
            className={`${primaryButtonClass} flex-1`}
            disabled={!payout.addressId || !payout.accountId || !payout.isSeller}
            onClick={() => {
              const linked = payout.confirm();
              if (!linked) return;
              onClose();
              router.push(`/chat/${linked}`);
            }}
          >
            {t("chatApproveSend")}
          </button>
        </div>
      </div>
    </div>
  );
}

function roomTitle(room: { productId: string; sellerName: string }, products: Product[], buyer: string) {
  const product = products.find((item) => item.id === room.productId);
  return product?.sellerId === "me" ? `${buyer} ${room.sellerName}` : room.sellerName;
}

function previewText(message: ChatMessage | undefined, t: (key: UiKey) => string) {
  if (!message) return "";
  if (message.systemKey) return systemBody(message, t).split("\n")[0] ?? "";
  if (message.videoUrl && !message.originalText && !message.text) return t("chatVideo");
  if (message.imageUrl && !message.originalText && !message.text) return t("chatPhoto");
  return message.originalText ?? message.text ?? "";
}

export function ProductInquiry({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const { rooms } = useSpark();
  const { t } = useI18n();
  const room = rooms.find((item) => item.productId === productId && roomInInbox(item));
  if (!room) return null;
  const messages = room.messages;

  return (
    <section
      className={
        compact
          ? "min-w-0 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
          : "rounded-2xl border border-slate-200 p-4"
      }
    >
      <div className={`flex min-w-0 items-center justify-between gap-2 ${compact ? "mb-2" : "mb-3"}`}>
        <h2 className={`min-w-0 truncate font-medium text-slate-900 ${compact ? "text-xs" : "text-sm"}`}>
          {t("chatInquiry")} · {room.sellerName}
        </h2>
        <Link href={`/chat/${room.id}`} className="shrink-0 text-[11px] font-medium text-slate-500 hover:text-slate-800">
          {t("chatOpen")}
        </Link>
      </div>
      <div className={compact ? "max-h-40 min-w-0 space-y-2 overflow-y-auto" : "space-y-3"}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} compact={compact} />
        ))}
      </div>
    </section>
  );
}

function MessageBubble({ message, compact = false, mine = message.sender === "me", footer = null, enter = false }: { message: ChatMessage; compact?: boolean; mine?: boolean; footer?: ReactNode; enter?: boolean }) {
  const { locale } = useSpark();
  const { t } = useI18n();
  const localized = message.systemKey ? systemBody(message, t) : "";
  const source = localized || message.originalText || message.text || "";
  const [showing, setShowing] = useState<"original" | "translated">("original");
  const [pending, setPending] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const body = showing === "translated" && translated ? translated : source;
  const system = message.sender === "system";
  const rise = enter ? "spark-rise" : "";

  useEffect(() => {
    setShowing("original");
    setTranslated(null);
  }, [locale, source]);

  async function toggleTranslation() {
    if (!source) return;
    if (showing === "translated") {
      setShowing("original");
      return;
    }
    setPending(true);
    const next = await translateMessage(source, locale);
    setTranslated(next);
    setShowing("translated");
    setPending(false);
  }

  const translateButton = source && !message.systemKey ? (
    <button
      type="button"
      onClick={() => void toggleTranslation()}
      disabled={pending}
      className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline disabled:opacity-60"
    >
      {pending ? t("chatTranslating") : showing === "translated" ? t("chatOriginal") : t("chatTranslate")}
    </button>
  ) : null;

  if (system) {
    return (
      <div className={`flex justify-center ${rise}`}>
        <div className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm ${compact ? "text-xs" : "text-sm"}`}>
          <p className="text-[11px] font-medium tracking-[0.16em] text-slate-400">{message.kind === "payment" ? t("chatPayment") : t("chatSystem")}</p>
          <p className="mt-1 font-medium leading-6 whitespace-pre-line">{body}</p>
          {footer}
          <span className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
            {message.at}
            {translateButton}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex min-w-0 flex-col gap-1 ${compact ? "max-w-full" : "max-w-[78%]"} ${mine ? "items-end" : "items-start"}`}>
        {message.kind === "purchase" ? (
          <div className={`w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm ${compact ? "text-xs" : "text-sm"}`}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-400">{t("chatPurchase")}</p>
            <p className="mt-1 font-medium leading-6 whitespace-pre-line">{body}</p>
            {footer}
          </div>
        ) : (
          <div className={`overflow-hidden break-words rounded-2xl px-3 py-2 leading-6 whitespace-pre-line ${compact ? "text-xs" : "text-sm"} ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"}`}>
            {message.imageUrl ? <img src={message.imageUrl} alt={t("chatPhoto")} className={`mb-2 w-full rounded-xl object-cover ${compact ? "max-h-28" : "max-h-48"}`} /> : null}
            {message.videoUrl ? <video src={message.videoUrl} controls className={`mb-2 w-full rounded-xl ${compact ? "max-h-28" : "max-h-48"}`} /> : null}
            {body}
          </div>
        )}
        {message.langLabel ? <span className="text-[10px] text-slate-400">원문 · {message.langLabel}</span> : null}
        {translateButton}
        <span className="text-[10px] text-slate-400">{message.at}</span>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
      <ProductVisual motif={product.motif} palette={product.palette} uid={`chat-${product.id}`} imageUrl={product.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-xl" />
      <span>
        <span className="block text-[11px] text-slate-400">{product.category}</span>
        <span className="block text-sm font-medium text-slate-800">{product.title}</span>
        <span className="mt-1 block text-sm tabular-nums text-slate-500">{formatPrice(product.price)}</span>
      </span>
    </Link>
  );
}
