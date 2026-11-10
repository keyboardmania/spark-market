"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice, getProductById, getSeller, settlementOf, type ChatMessage, type Product } from "@/data/mockData";
import { ReportButton } from "@/components/spark/ReportDialog";
import { ProductVisual } from "@/components/spark/ProductVisual";
import { fieldClass, ghostButtonClass, primaryButtonClass } from "@/components/spark/styles";
import { useSpark } from "@/components/spark/SparkProvider";
import { useMounted } from "@/components/spark/useMounted";

const EMOJIS = ["✨", "💖", "🧸", "😊", "🙌", "🎀", "😭", "⚡"];

export function ChatScreen({ initialRoomId }: { initialRoomId?: string }) {
  const mounted = useMounted();
  const { rooms, products, user, addresses, isProductDeleted, typingRoomId, sendMessage, markRead, leaveRoom, notify, requestPurchase, decidePurchase, completePurchase } = useSpark();
  const [activeId, setActiveId] = useState(initialRoomId ?? "room-hinata");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [approvalOpen, setApprovalOpen] = useState(false);
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

  useEffect(() => {
    const timer = window.setTimeout(() => setConnected(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (active?.id) markRead(active.id);
  }, [active?.id, markRead]);

  useEffect(() => {
    if (role === "seller" && active?.purchase?.status === "대기") setApprovalOpen(true);
  }, [role, active?.id, active?.purchase?.status]);

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
    sendMessage(active.id, { text, sender: role === "seller" ? "seller" : "me" });
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
        sendMessage(active.id, { imageUrl: reader.result, text: "사진을 보냈어요.", sender: role === "seller" ? "seller" : "me" });
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
                  <p className="text-xs text-slate-400">{active.sellerHandle}</p>
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
                  <MessageBubble key={message.id} message={message} mine={role === "seller" ? message.sender === "seller" : message.sender === "me"} />
                ))}
                {typingRoomId === active.id ? <p className="text-xs text-slate-400">상대방이 입력 중이에요.</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-3 py-2">
                <div className="flex rounded-full bg-slate-50 p-1 text-xs">
                  {(["buyer", "seller"] as const).map((item) => (
                    <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-full px-3 py-1.5 ${role === item ? "bg-white font-medium text-slate-900" : "text-slate-400"}`}>
                      {item === "buyer" ? "구매자" : "판매자"}
                    </button>
                  ))}
                </div>
                {role === "buyer" && product.saleStatus === "판매중" && active.purchase?.status !== "대기" && active.purchase?.status !== "승인" && active.purchase?.status !== "결제완료" ? (
                  <button type="button" className={primaryButtonClass} onClick={() => requestPurchase(active.id)}>구매 신청</button>
                ) : null}
                {role === "buyer" && active.purchase?.status === "승인" ? (
                  <button type="button" className={primaryButtonClass} onClick={() => setPayOpen(true)}>결제 정보 입력</button>
                ) : null}
                {role === "seller" && active.purchase?.status === "대기" ? (
                  <button type="button" className={ghostButtonClass} onClick={() => setApprovalOpen(true)}>판매 승인</button>
                ) : null}
                {active.purchase ? <span className="text-xs text-slate-400">신청 상태 {active.purchase.status}</span> : null}
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
              {approvalOpen && active.purchase?.status === "대기" ? (
                <SellerApproval
                  product={product}
                  vip={Boolean(user?.membership === "vip" && product.sellerId === "me")}
                  defaultAddress={addresses.find((item) => item.isDefault)}
                  onClose={() => setApprovalOpen(false)}
                  onReject={(address, account) => {
                    decidePurchase(active.id, false, address, account);
                    setApprovalOpen(false);
                  }}
                  onAccept={(address, account) => {
                    decidePurchase(active.id, true, address, account);
                    setApprovalOpen(false);
                  }}
                />
              ) : null}
              {payOpen && active.purchase?.status === "승인" ? (
                <BuyerPayment
                  product={product}
                  defaultAddress={addresses.find((item) => item.isDefault)}
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

function MessageBubble({ message, compact = false, mine = message.sender === "me" }: { message: ChatMessage; compact?: boolean; mine?: boolean }) {
  const canTranslate = !mine && Boolean(message.originalText && message.translatedText);
  const [showOriginal, setShowOriginal] = useState(false);
  const body = canTranslate ? (showOriginal ? message.originalText : message.translatedText) : message.text;

  return (
    <div className={`flex min-w-0 ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`flex min-w-0 flex-col gap-1 ${compact ? "max-w-full" : "max-w-[78%]"} ${mine ? "items-end" : "items-start"}`}>
        {message.kind === "purchase" ? (
          <div className={`w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-sm ${compact ? "text-xs" : "text-sm"}`}>
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-400">구매 신청</p>
            <p className="mt-1 font-medium leading-6">{body}</p>
            <p className="mt-1 text-xs text-slate-400">판매자의 수락을 기다립니다.</p>
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

function SellerApproval({
  product,
  vip,
  defaultAddress,
  onClose,
  onAccept,
  onReject,
}: {
  product: Product;
  vip: boolean;
  defaultAddress?: { address: string; detail: string; postalCode: string };
  onClose: () => void;
  onAccept: (address: string, account: string) => void;
  onReject: (address: string, account: string) => void;
}) {
  const money = settlementOf(product.price, vip);
  const filled = defaultAddress ? `(${defaultAddress.postalCode}) ${defaultAddress.address} ${defaultAddress.detail}` : "";
  const [address, setAddress] = useState(filled);
  const [account, setAccount] = useState("");
  const ready = address.trim().length > 0 && account.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">판매 승인</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">기본 배송지와 정산 계좌를 확인한 뒤 승인하거나 거절하세요. 거절하면 상품은 판매중으로 남습니다.</p>
        <label className="mt-4 block space-y-2 text-xs text-slate-500">판매자 주소
          <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass} />
        </label>
        <label className="mt-3 block space-y-2 text-xs text-slate-500">정산 계좌
          <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder="은행 · 계좌번호 · 예금주" className={fieldClass} />
        </label>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-slate-500">상품 금액</dt><dd>{formatPrice(product.price)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">수수료 {Math.round(money.feeRate * 100)}%</dt><dd>{formatPrice(money.feeAmount)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>정산 예정액</dt><dd>{formatPrice(money.payoutAmount)}</dd></div>
        </dl>
        <p className="mt-3 text-xs leading-5 text-slate-400">수수료는 판매자 정산 때 빠집니다. USD 결제액만 고정되고 환율 숫자는 표시하지 않습니다.</p>
        <div className="mt-5 flex gap-2">
          <button type="button" className={ghostButtonClass} onClick={() => onReject(address, account)}>거절</button>
          <button type="button" disabled={!ready} className={primaryButtonClass} onClick={() => onAccept(address.trim(), account.trim())}>승인</button>
          <button type="button" className={ghostButtonClass} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

function BuyerPayment({
  product,
  defaultAddress,
  onClose,
  onPay,
}: {
  product: Product;
  defaultAddress?: { name: string; address: string; detail: string; postalCode: string };
  onClose: () => void;
  onPay: (payment: { address: string; customsNumber: string; paymentMethod: string }) => void;
}) {
  const filled = defaultAddress ? `${defaultAddress.name} (${defaultAddress.postalCode}) ${defaultAddress.address} ${defaultAddress.detail}` : "";
  const [address, setAddress] = useState(filled);
  const [customsNumber, setCustomsNumber] = useState("");
  const [method, setMethod] = useState("");
  const [terms, setTerms] = useState(false);
  const total = product.price + product.shippingFee;
  const ready = address.trim() && customsNumber.trim() && method && terms;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <form
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (!ready) return;
          onPay({ address: address.trim(), customsNumber: customsNumber.trim(), paymentMethod: method });
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">결제 정보</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">결제하면 PG사 예치가 완료된 것으로 기록되고, 상품 금액과 수수료율이 고정됩니다.</p>
        <label className="mt-4 block space-y-2 text-xs text-slate-500">배송지
          <input value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass} />
        </label>
        <label className="mt-3 block space-y-2 text-xs text-slate-500">통관번호
          <input value={customsNumber} onChange={(event) => setCustomsNumber(event.target.value)} className={fieldClass} />
        </label>
        <label className="mt-3 block space-y-2 text-xs text-slate-500">결제수단
          <select value={method} onChange={(event) => setMethod(event.target.value)} className={fieldClass}>
            <option value="">선택해 주세요</option>
            {["신용/체크카드", "휴대폰 결제", "PayPal", "Apple Pay", "Google Pay"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} className="mt-1" />
          필수 이용약관과 구매조건에 동의합니다.
        </label>
        <p className="mt-3 text-sm font-semibold text-slate-900">결제 금액 {formatPrice(total)}</p>
        <div className="mt-5 flex gap-2">
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
