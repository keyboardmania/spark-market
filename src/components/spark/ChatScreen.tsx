"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, getProductById, type ChatMessage, type Product } from "@/data/mockData";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const EMOJIS = ["✨", "💖", "🧸", "😊", "🙌", "🎀", "😭", "⚡"];

export function ChatScreen({ initialRoomId }: { initialRoomId?: string }) {
  const mounted = useMounted();
  const { rooms, products, isProductDeleted, typingRoomId, sendMessage, markRead } = useSpark();
  const [activeId, setActiveId] = useState(initialRoomId ?? "room-hinata");
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showList, setShowList] = useState(!initialRoomId);
  const [connected, setConnected] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const active = rooms.find((room) => room.id === (activeId || initialRoomId)) ?? null;
  const product = active
    ? isProductDeleted(active.productId)
      ? null
      : products.find((item) => item.id === active.productId) ?? getProductById(active.productId)
    : null;

  useEffect(() => {
    const timer = window.setTimeout(() => setConnected(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (active?.id) markRead(active.id);
  }, [active?.id, markRead]);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [active?.messages.length, typingRoomId, active?.id, showList]);

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
    setShowList(false);
  }

  function submit() {
    const text = draft.trim();
    if (!active || !text) return;
    sendMessage(active.id, { text });
    setDraft("");
    setEmojiOpen(false);
  }

  function attach(file: File | undefined) {
    if (!active || !file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sendMessage(active.id, { imageUrl: reader.result, text: "사진을 보냈어요." });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div ref={frameRef} className="mx-auto flex min-h-[420px] max-w-6xl flex-col px-4 py-4 sm:px-6">
      <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">LIVE CHAT</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">1:1 채팅</h1>
        </div>
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "animate-pulse bg-amber-300"}`} />
          {connected ? "WebSocket · 실시간 연결됨" : "WebSocket · 연결 중"}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={`${showList ? "flex" : "hidden"} min-h-0 flex-col border-slate-100 md:flex md:border-r`}>
          <p className="px-4 py-3 text-xs font-medium text-slate-400">대화</p>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {rooms.map((room) => {
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
                      <span className="text-sm font-medium text-slate-900">{roomTitle(room, products)}</span>
                      {room.unread > 0 ? (
                        <span className="rounded-full bg-rose-400 px-1.5 text-[10px] leading-4 text-white">{room.unread}</span>
                      ) : null}
                    </span>
                    <span className="line-clamp-1 text-xs text-slate-400">{previewText(last)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className={`${showList ? "hidden" : "flex"} min-h-0 flex-col md:flex`}>
          {active && product ? (
            <>
              <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <button type="button" className="text-sm text-slate-400 md:hidden" onClick={() => setShowList(true)}>
                  목록
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-900">{roomTitle(active, products)}</p>
                  <p className="text-xs text-slate-400">{active.sellerHandle}</p>
                </div>
              </header>
              <div className="border-b border-slate-100 px-4 py-3">
                <ProductSummary product={product} />
              </div>
              <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-4">
                {active.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {typingRoomId === active.id ? <p className="text-xs text-slate-400">상대방이 입력 중이에요.</p> : null}
              </div>
              <form
                className="border-t border-slate-100 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  submit();
                }}
              >
                {emojiOpen ? (
                  <div className="mb-2 flex flex-wrap gap-1 rounded-2xl bg-slate-50 p-2">
                    {EMOJIS.map((emoji) => (
                      <button key={emoji} type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white" onClick={() => setDraft((current) => `${current}${emoji}`)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => attach(event.target.files?.[0])} />
                  <button type="button" aria-label="이미지 첨부" onClick={() => fileRef.current?.click()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-sm text-slate-500">
                    사진
                  </button>
                  <button type="button" aria-label="이모티콘" aria-expanded={emojiOpen} onClick={() => setEmojiOpen((open) => !open)} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-sm">
                    😊
                  </button>
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="메시지를 입력해 주세요" className={fieldClass} />
                  <button type="submit" className="shrink-0 rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white">
                    보내기
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-slate-400">대화방을 선택해 주세요.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function roomTitle(room: { productId: string; sellerName: string }, products: Product[]) {
  const product = products.find((item) => item.id === room.productId);
  return product?.sellerId === "me" ? `구매자 ${room.sellerName}` : room.sellerName;
}

function previewText(message?: ChatMessage) {
  if (!message) return "";
  if (message.imageUrl && !message.translatedText && !message.text) return "사진";
  return message.translatedText ?? message.text ?? "";
}

export function ProductInquiry({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const { rooms } = useSpark();
  const room = rooms.find(
    (item) => item.productId === productId && item.messages.some((message) => message.originalText && message.translatedText),
  );
  if (!room) return null;
  const messages = compact ? room.messages.filter((message) => message.originalText && message.translatedText) : room.messages;

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
          구매자 문의 · {room.sellerName}
        </h2>
        <Link href={`/chat/${room.id}`} className="shrink-0 text-[11px] font-medium text-slate-500 hover:text-slate-800">
          채팅 열기
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

function MessageBubble({ message, compact = false }: { message: ChatMessage; compact?: boolean }) {
  const canTranslate = message.sender !== "me" && Boolean(message.originalText && message.translatedText);
  const [showOriginal, setShowOriginal] = useState(false);
  const body = canTranslate ? (showOriginal ? message.originalText : message.translatedText) : message.text;
  const mine = message.sender === "me";

  return (
    <div className={`flex min-w-0 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex min-w-0 flex-col gap-1 ${compact ? "max-w-full" : "max-w-[78%]"} ${mine ? "items-end" : "items-start"}`}>
        <div className={`overflow-hidden break-words rounded-2xl px-3 py-2 leading-6 ${compact ? "text-xs" : "text-sm"} ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"}`}>
          {message.imageUrl ? <img src={message.imageUrl} alt="첨부 이미지" className={`mb-2 w-full rounded-xl object-cover ${compact ? "max-h-28" : "max-h-48"}`} /> : null}
          {body}
        </div>
        {canTranslate ? (
          <button
            type="button"
            aria-pressed={showOriginal}
            onClick={() => setShowOriginal((current) => !current)}
            className="text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
          >
            {showOriginal ? "Translate" : "원문 보기"}
          </button>
        ) : null}
        <span className="text-[10px] text-slate-400">{message.at}</span>
      </div>
    </div>
  );
}

function ProductSummary({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-2.5">
      <ProductVisual motif={product.motif} palette={product.palette} ip={product.ip} uid={`chat-${product.id}`} imageUrl={product.imageUrl} alt="" showLabel={false} className="h-16 w-16 shrink-0 rounded-xl" />
      <span>
        <span className="block text-[11px] text-slate-400">{product.ip}</span>
        <span className="block text-sm font-medium text-slate-800">{product.title}</span>
        <span className="mt-1 block text-sm tabular-nums text-slate-500">{formatPrice(product.price)}</span>
      </span>
    </Link>
  );
}
