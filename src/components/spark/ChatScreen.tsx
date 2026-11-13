"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatPrice, getProductById, getSeller, needsCustomsNumber, type ChatMessage, type Product, type ShippingAddress } from "@/data/mockData";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const EMOJIS = ["✨", "💖", "🧸", "😊", "🙌", "🎀", "😭", "⚡"];

const PAYMENT_METHODS = ["신용/체크카드", "휴대폰", "페이팔", "애플페이", "구글페이"] as const;

export function ChatScreen({ initialRoomId }: { initialRoomId?: string }) {
  const mounted = useMounted();
  const { rooms, products, addresses, isProductDeleted, typingRoomId, sendMessage, markRead, leaveRoom, notify, decidePurchase, completePurchase } = useSpark();
  const [activeId, setActiveId] = useState(initialRoomId ?? "room-hinata");
  const [payOpen, setPayOpen] = useState(false);
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
  const isSeller = product?.sellerId === "me";

  useEffect(() => {
    const timer = window.setTimeout(() => setConnected(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (active?.id) markRead(active.id);
  }, [active?.id, markRead]);

  useEffect(() => {
    setPayOpen(false);
  }, [active?.id]);

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
    sendMessage(active.id, { text, sender: "me" });
    setDraft("");
    setEmojiOpen(false);
  }

  function attach(file: File | undefined) {
    if (!active || !file) return;
    const used = active.messages.filter((message) => message.imageUrl).length;
    const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase() : "";
    if (used >= 10) {
      notify("채팅 미디어는 최대 10개까지예요.");
      return;
    }
    if (!["png", "jpg", "jpeg", "mp4", "mov"].includes(extension)) {
      notify("png, jpg, jpeg, mp4, mov만 첨부할 수 있어요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sendMessage(active.id, { imageUrl: reader.result, text: "사진을 보냈어요.", sender: "me" });
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{roomTitle(active, products)}</p>
                  <p className="text-xs text-slate-400">{isSeller ? "내 판매 상품" : active.sellerHandle}</p>
                </div>
                <ReportButton
                  targetType="유저"
                  targetId={product.sellerId === "me" ? active.sellerName : getSeller(product.sellerId).name}
                  targetLabel={product.sellerId === "me" ? active.sellerName : getSeller(product.sellerId).name}
                />
                <button type="button" className="text-xs text-slate-500" onClick={() => leaveRoom(active.id)}>나가기</button>
                <button
                  type="button"
                  className="text-xs text-rose-600"
                  onClick={() => {
                    if (window.confirm("이 채팅방을 삭제할까요?")) leaveRoom(active.id);
                  }}
                >
                  삭제
                </button>
              </header>
              <div className="border-b border-slate-100 px-4 py-3">
                <ProductSummary product={product} />
              </div>
              <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-4 py-4">
                {active.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    mine={message.sender === "me"}
                    footer={messageFooter(message, {
                      isSeller,
                      status: active.purchase?.status,
                      onAccept: () => decidePurchase(active.id, true),
                      onReject: () => decidePurchase(active.id, false),
                      onPay: () => setPayOpen(true),
                    })}
                  />
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
                  <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.mp4,.mov,image/png,image/jpeg,video/mp4,video/quicktime" className="sr-only" onChange={(event) => { attach(event.target.files?.[0]); event.target.value = ""; }} />
                  <button type="button" aria-label="미디어 첨부" onClick={() => fileRef.current?.click()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-xs text-slate-500">
                    첨부
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
              {payOpen && !isSeller && active.purchase?.status === "승인" ? (
                <PaymentSheet
                  product={product}
                  addresses={addresses}
                  onClose={() => setPayOpen(false)}
                  onPay={(payment) => {
                    completePurchase(active.id, payment);
                    setPayOpen(false);
                  }}
                />
              ) : null}
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-slate-400">대화방을 선택해 주세요.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function messageFooter(
  message: ChatMessage,
  actions: {
    isSeller: boolean;
    status?: string;
    onAccept: () => void;
    onReject: () => void;
    onPay: () => void;
  },
) {
  if (message.kind === "purchase" && actions.status === "대기" && actions.isSeller) {
    return (
      <div className="mt-3 flex gap-2">
        <button type="button" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={actions.onReject}>
          거절
        </button>
        <button type="button" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={actions.onAccept}>
          수락
        </button>
      </div>
    );
  }
  if (message.kind === "purchase" && actions.status === "대기" && !actions.isSeller) {
    return <p className="mt-1 text-xs text-slate-400">판매자의 수락을 기다립니다.</p>;
  }
  if (message.kind === "payment" && actions.status === "승인" && !actions.isSeller) {
    return (
      <button type="button" className={`${primaryButtonClass} mt-3`} onClick={actions.onPay}>
        결제하기
      </button>
    );
  }
  return null;
}

function roomTitle(room: { productId: string; sellerName: string }, products: Product[]) {
  const product = products.find((item) => item.id === room.productId);
  return product?.sellerId === "me" ? `구매자 ${room.sellerName}` : room.sellerName;
}

function previewText(message?: ChatMessage) {
  if (!message) return "";
  if (message.videoUrl && !message.translatedText && !message.text) return "동영상";
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

function MessageBubble({ message, compact = false, mine = message.sender === "me", footer = null }: { message: ChatMessage; compact?: boolean; mine?: boolean; footer?: ReactNode }) {
  const canTranslate = !mine && message.sender !== "system" && Boolean(message.originalText && message.translatedText);
  const [showOriginal, setShowOriginal] = useState(false);
  const body = canTranslate ? (showOriginal ? message.originalText : message.translatedText) : message.text;
  const system = message.sender === "system";

  if (system) {
    return (
      <div className="flex justify-center">
        <div className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm ${compact ? "text-xs" : "text-sm"}`}>
          <p className="text-[11px] font-medium tracking-[0.16em] text-slate-400">{message.kind === "payment" ? "결제 안내" : "안내"}</p>
          <p className="mt-1 font-medium leading-6">{body}</p>
          {footer}
          <span className="mt-2 block text-[10px] text-slate-400">{message.at}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex min-w-0 flex-col gap-1 ${compact ? "max-w-full" : "max-w-[78%]"} ${mine ? "items-end" : "items-start"}`}>
        {message.kind === "purchase" ? (
          <div className={`w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm ${compact ? "text-xs" : "text-sm"}`}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-400">수락 요청</p>
            <p className="mt-1 font-medium leading-6">{body}</p>
            {footer}
          </div>
        ) : (
          <div className={`overflow-hidden break-words rounded-2xl px-3 py-2 leading-6 ${compact ? "text-xs" : "text-sm"} ${mine ? "rounded-br-md bg-slate-900 text-white" : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"}`}>
            {message.imageUrl ? <img src={message.imageUrl} alt="첨부 이미지" className={`mb-2 w-full rounded-xl object-cover ${compact ? "max-h-28" : "max-h-48"}`} /> : null}
            {message.videoUrl ? <video src={message.videoUrl} controls className={`mb-2 w-full rounded-xl ${compact ? "max-h-28" : "max-h-48"}`} /> : null}
            {body}
          </div>
        )}
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

function addressLine(item: ShippingAddress) {
  return `${item.address} ${item.detail}`.trim();
}

function formatDestination(item: ShippingAddress) {
  return `${item.name} · ${item.phone} · (${item.postalCode}) ${item.address} ${item.detail}`;
}

function PaymentSheet({
  product,
  addresses,
  onClose,
  onPay,
}: {
  product: Product;
  addresses: ShippingAddress[];
  onClose: () => void;
  onPay: (payment: { address: string; customsNumber: string; paymentMethod: string }) => void;
}) {
  const fallback = addresses.find((item) => item.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState(fallback?.id ?? "");
  const [method, setMethod] = useState("");
  const [terms, setTerms] = useState(false);
  const [customsNumber, setCustomsNumber] = useState("");
  const selected = addresses.find((item) => item.id === addressId) ?? null;
  const destination = selected ? addressLine(selected) : "";
  const showCustoms = needsCustomsNumber(product, destination);
  const ready = Boolean(selected && method && terms && (!showCustoms || customsNumber.trim()));
  const total = product.price + product.shippingFee;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40" onClick={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-sheet-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white px-5 pt-4 pb-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready || !selected) return;
          onPay({
            address: formatDestination(selected),
            customsNumber: showCustoms ? customsNumber.trim() : "",
            paymentMethod: method,
          });
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200" />
        <h2 id="payment-sheet-title" className="text-lg font-semibold text-slate-900">안전결제</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">기본 배송지로 결제하고, 필요하면 주소록에서 다른 배송지를 고르세요.</p>

        <fieldset className="mt-5">
          <legend className="text-xs font-medium text-slate-500">배송지</legend>
          {addresses.length === 0 ? (
            <p className="mt-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
              등록된 배송지가 없어요.{" "}
              <Link href="/mypage#addresses" className="font-medium text-slate-900 underline">
                주소록에서 기본 배송지를 등록
              </Link>
              하면 여기에 자동으로 채워집니다.
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {addresses.map((item) => (
                <label key={item.id} className={`flex cursor-pointer gap-3 rounded-2xl border px-3 py-3 text-sm ${addressId === item.id ? "border-slate-900" : "border-slate-200"}`}>
                  <input
                    type="radio"
                    name="shipping-address"
                    className="mt-1"
                    checked={addressId === item.id}
                    onChange={() => setAddressId(item.id)}
                  />
                  <span>
                    <span className="block font-medium text-slate-900">
                      {item.name}
                      {item.isDefault ? <span className="ml-2 text-xs font-normal text-slate-400">기본 배송지</span> : null}
                    </span>
                    <span className="mt-1 block leading-5 text-slate-500">{formatDestination(item)}</span>
                  </span>
                </label>
              ))}
              <Link href="/mypage#addresses" className="inline-block text-xs font-medium text-slate-500 underline">
                주소록에서 배송지 변경
              </Link>
            </div>
          )}
        </fieldset>

        {showCustoms ? (
          <label className="mt-4 block space-y-2 text-xs text-slate-500">
            통관번호
            <input value={customsNumber} onChange={(event) => setCustomsNumber(event.target.value)} placeholder="개인통관고유부호" className={fieldClass} />
            <span className="block leading-5 text-slate-400">해외 카테고리이거나 배송지가 해외일 때 입력합니다.</span>
          </label>
        ) : null}

        <fieldset className="mt-5">
          <legend className="text-xs font-medium text-slate-500">안전결제 수단</legend>
          <div className="mt-2 grid gap-2">
            {PAYMENT_METHODS.map((item) => (
              <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${method === item ? "border-slate-900 font-medium" : "border-slate-200"}`}>
                <input type="radio" name="payment-method" checked={method === item} onChange={() => setMethod(item)} />
                {item}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-1" />
          <span>
            <Link href="/legal/terms" className="underline">필수 이용약관</Link>
            과 구매조건에 동의합니다.
          </span>
        </label>

        <p className="mt-4 text-sm font-semibold text-slate-900">결제 금액 {formatPrice(total)}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" className={ghostButtonClass} onClick={onClose}>닫기</button>
          <button type="submit" disabled={!ready} className={primaryButtonClass}>{formatPrice(total)} 결제하기</button>
        </div>
      </form>
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
