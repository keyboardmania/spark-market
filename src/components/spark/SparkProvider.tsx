"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ADDRESS_LIMIT,
  BANK_LIMIT,
  CHAT_ROOMS,
  ORDERS,
  PRODUCTS,
  SELLER_REPLIES,
  SEED_NOTIFICATIONS,
  TEST_VERIFICATION_CODE,
  formatPrice,
  formatTime,
  getSeller,
  sellerAccount,
  hardDeleteAtFrom,
  settlementOf,
  type AddressDraft,
  type AppNotification,
  type BankAccount,
  type ChatMessage,
  type ChatRoom,
  type NotifyMode,
  type Order,
  type Product,
  type ShippingAddress,
  type SparkUser,
} from "@/data/mockData";
import type { LocaleId } from "@/i18n";
import { applyRetentionPolicy, getShared, useShared } from "@/data/shared";

type StoredAccount = {
  name: string;
  email: string;
  password: string;
  provider: SparkUser["provider"];
  membership?: SparkUser["membership"];
  photoUrl?: string;
  withdrawn?: boolean;
};

export type RetentionNote = {
  hasTrades: boolean;
  retainUntil: string | null;
  token: string;
};

const RESERVED_EMAILS = new Set(["taken@spark.market"]);
const AUTH_STORAGE_KEY = "spark-auth-session";
const ACCOUNTS_STORAGE_KEY = "spark-accounts";
const ACCESS_COOKIE = "spark_access";
const REFRESH_COOKIE = "spark_refresh";
const ACCESS_MAX_AGE = 60 * 60 * 24 * 7;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  user: SparkUser;
};

function issueTokens(user: SparkUser) {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return {
    accessToken: `atk_${user.provider}_${stamp}`,
    refreshToken: `rtk_${stamp}`,
  };
}

function writeCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function storeAuth(session: StoredAuth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  writeCookie(ACCESS_COOKIE, session.accessToken, ACCESS_MAX_AGE);
  writeCookie(REFRESH_COOKIE, session.refreshToken, REFRESH_MAX_AGE);
}

function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user?.email || !parsed.user.name || !parsed.user.provider) return null;
    return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken, user: parsed.user };
  } catch (error) {
    console.error("[Spark] 저장된 로그인 세션을 읽지 못했어요.", error);
    return null;
  }
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    clearCookie(ACCESS_COOKIE);
    clearCookie(REFRESH_COOKIE);
  } catch (error) {
    console.error("[Spark] 로그인 세션을 지우지 못했어요.", error);
  }
}

function readStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.email === "string" && typeof item.name === "string");
  } catch (error) {
    console.error("[Spark] 저장된 계정을 읽지 못했어요.", error);
    return [];
  }
}

type SparkContextValue = {
  user: SparkUser | null;
  login: (user: SparkUser) => void;
  logout: () => void;
  isEmailTaken: (email: string) => boolean;
  findAccount: (email: string) => SparkUser | null;
  registerAccount: (account: StoredAccount) => void;
  authenticate: (email: string, password: string) => SparkUser | null;
  activateMembership: () => boolean;
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  products: Product[];
  isProductDeleted: (id: string) => boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => boolean;
  softDeleteProduct: (id: string) => void;
  addresses: ShippingAddress[];
  addAddress: (draft: AddressDraft) => "ok" | "limit";
  updateAddress: (id: string, draft: AddressDraft) => "ok" | "missing" | "keep-default";
  removeAddress: (id: string) => "ok" | "missing" | "keep-default";
  setDefaultAddress: (id: string) => void;
  orders: Order[];
  placeOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  requestCancel: (id: string, reason: string, detail: string) => void;
  rooms: ChatRoom[];
  typingRoomId: string | null;
  ensureRoom: (product: Product) => string | null;
  startPurchase: (product: Product) => string | null;
  sendMessage: (roomId: string, message: Pick<ChatMessage, "text" | "imageUrl"> & { sender?: ChatMessage["sender"] }) => void;
  requestPurchase: (roomId: string) => void;
  decidePurchase: (roomId: string, accept: boolean, sellerAddress: string, sellerAccount: string) => void;
  completePurchase: (roomId: string, payment: { address: string; customsNumber: string; paymentMethod: string }) => string | null;
  markRead: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  notify: (message: string) => void;
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  banks: BankAccount[];
  addBank: (draft: Omit<BankAccount, "id">) => "ok" | "limit";
  removeBank: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  notifyMode: NotifyMode;
  setNotifyMode: (mode: NotifyMode) => void;
  updateProfile: (patch: { name?: string; photoUrl?: string }) => void;
  requestResetCode: (email: string) => boolean;
  resetPassword: (email: string, code: string, nextPassword: string) => boolean;
  changePassword: (email: string, currentPassword: string, code: string, nextPassword: string) => boolean;
  withdraw: (password: string) => "ok" | "bad-password" | "guest";
  retention: RetentionNote | null;
};

const SparkContext = createContext<SparkContextValue | null>(null);
const CANCEL_WINDOW_MS = 72 * 60 * 60 * 1000;

function expireCancelRequests(orders: Order[], now = Date.now()) {
  let changed = false;
  const next = orders.map((order) => {
    const request = order.cancelRequest;
    if (!request || request.autoCancelled || order.status === "거래취소") return order;
    const requestedAt = new Date(request.requestedAt).getTime();
    if (Number.isNaN(requestedAt) || requestedAt + CANCEL_WINDOW_MS > now) return order;
    changed = true;
    return {
      ...order,
      status: "거래취소" as const,
      cancelRequest: { ...request, autoCancelled: true },
    };
  });
  return changed ? next : orders;
}

export function SparkProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SparkUser | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [accountsReady, setAccountsReady] = useState(false);
  const [locale, setLocale] = useState<LocaleId>("ko");
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [notifyMode, setNotifyMode] = useState<NotifyMode>("소리");
  const [retention, setRetention] = useState<RetentionNote | null>(null);
  const shared = useShared();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [records, setRecords] = useState<Array<Product & { deletedAt: string | null; hardDeleteAt: string | null }>>(() => {
    const removed = new Map(getShared().deletions.filter((item) => item.kind === "상품").map((item) => [item.id, item]));
    return PRODUCTS.map((product) => {
      const hit = removed.get(product.id);
      return { ...product, deletedAt: hit?.deletedAt ?? null, hardDeleteAt: hit?.hardDeleteAt ?? null };
    });
  });
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [rooms, setRooms] = useState<ChatRoom[]>(CHAT_ROOMS);
  const [typingRoomId, setTypingRoomId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const replyCursor = useRef(0);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  const pushNotice = useCallback((notice: Omit<AppNotification, "id" | "createdAt" | "isRead">) => {
    if (notifyMode === "무음") return;
    setNotifications((items) =>
      [{ ...notice, id: crypto.randomUUID(), createdAt: formatTime(), isRead: false }, ...items].slice(0, 50),
    );
  }, [notifyMode]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((items) => (items.every((item) => item.isRead) ? items : items.map((item) => ({ ...item, isRead: true }))));
  }, []);

  const products = useMemo(
    () =>
      records
        .filter((product) => product.deletedAt === null)
        .map(({ deletedAt: _deletedAt, hardDeleteAt: _hardDeleteAt, ...product }) => product),
    [records],
  );

  const login = useCallback((next: SparkUser) => {
    const tokens = issueTokens(next);
    try {
      storeAuth({ ...tokens, user: next });
    } catch (error) {
      console.error("[Spark] 로그인 세션을 저장하지 못했어요.", error);
    }
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  useEffect(() => {
    setAccounts(readStoredAccounts());
    const stored = readStoredAuth();
    if (stored) setUser(stored.user);
    setAccountsReady(true);
  }, []);

  useEffect(() => {
    if (!accountsReady) return;
    try {
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error("[Spark] 계정을 저장하지 못했어요.", error);
    }
  }, [accounts, accountsReady]);

  const isEmailTaken = useCallback(
    (email: string) => {
      const key = email.trim().toLowerCase();
      if (!key) return false;
      if (RESERVED_EMAILS.has(key)) return true;
      return accounts.some((account) => account.email.toLowerCase() === key);
    },
    [accounts],
  );

  const findAccount = useCallback(
    (email: string): SparkUser | null => {
      const key = email.trim().toLowerCase();
      const found = accounts.find((account) => account.email.toLowerCase() === key);
      if (!found || found.withdrawn) return null;
      return { name: found.name, email: found.email, provider: found.provider, membership: found.membership, photoUrl: found.photoUrl };
    },
    [accounts],
  );

  const registerAccount = useCallback((account: StoredAccount) => {
    const email = account.email.trim();
    const key = email.toLowerCase();
    setAccounts((current) => {
      if (current.some((item) => item.email.toLowerCase() === key)) return current;
      return [...current, { ...account, email }];
    });
  }, []);

  const authenticate = useCallback(
    (email: string, password: string): SparkUser | null => {
      const key = email.trim().toLowerCase();
      const found = accounts.find((account) => account.email.toLowerCase() === key);
      if (!found || found.withdrawn || found.provider !== "email" || !found.password || found.password !== password) return null;
      return { name: found.name, email: found.email, provider: "email", membership: found.membership, photoUrl: found.photoUrl };
    },
    [accounts],
  );

  const activateMembership = useCallback(() => {
    if (!user) return false;
    const key = user.email.trim().toLowerCase();
    setUser({ ...user, membership: "vip" });
    setAccounts((current) =>
      current.map((account) => (account.email.toLowerCase() === key ? { ...account, membership: "vip" } : account)),
    );
    return true;
  }, [user]);

  const toggleWishlist = useCallback(
    (id: string) => {
      const exists = wishlistIds.includes(id);
      setWishlistIds((current) => (exists ? current.filter((item) => item !== id) : [...current, id]));
      notify(exists ? "찜을 해제했어요." : "찜했어요.");
    },
    [notify, wishlistIds],
  );

  const isProductDeleted = useCallback(
    (id: string) => records.some((product) => product.id === id && product.deletedAt !== null),
    [records],
  );

  const addProduct = useCallback((product: Product) => {
    setRecords((current) => [
      { ...product, saleStatus: "판매중", deletedAt: null, hardDeleteAt: null },
      ...current.filter((item) => item.id !== product.id),
    ]);
  }, []);

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      const current = records.find((product) => product.id === id);
      if (!current || current.deletedAt || current.saleStatus === "판매완료") return false;
      if (patch.price !== undefined && patch.price < current.price && wishlistIds.includes(id)) {
        pushNotice({ kind: "가격하락", text: `${current.title} 가격이 내려갔어요.`, href: `/products/${id}` });
      }
      setRecords((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, ...patch, id: item.id, sellerId: item.sellerId, saleStatus: item.saleStatus, deletedAt: null, hardDeleteAt: null }
            : item,
        ),
      );
      return true;
    },
    [pushNotice, records, wishlistIds],
  );

  const softDeleteProduct = useCallback((id: string) => {
    const deletedAt = new Date().toISOString();
    const hardDeleteAt = hardDeleteAtFrom(deletedAt);
    setRecords((current) => current.map((item) => (item.id === id ? { ...item, deletedAt, hardDeleteAt: item.hardDeleteAt ?? hardDeleteAt } : item)));
  }, []);

  const addAddress = useCallback((draft: AddressDraft) => {
    if (addresses.length >= ADDRESS_LIMIT) return "limit" as const;
    const id = `addr-${crypto.randomUUID()}`;
    setAddresses((current) => {
      if (current.length >= ADDRESS_LIMIT) return current;
      const isDefault = current.length === 0 || draft.isDefault;
      const next: ShippingAddress = {
        id,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        address: draft.address.trim(),
        detail: draft.detail.trim(),
        postalCode: draft.postalCode.trim(),
        isDefault,
      };
      const rest = isDefault ? current.map((item) => ({ ...item, isDefault: false })) : current;
      return [...rest, next];
    });
    return "ok" as const;
  }, [addresses.length]);

  const updateAddress = useCallback((id: string, draft: AddressDraft) => {
    const target = addresses.find((item) => item.id === id);
    if (!target) return "missing" as const;
    if (target.isDefault && !draft.isDefault) return "keep-default" as const;
    setAddresses((current) => {
      const found = current.find((item) => item.id === id);
      if (!found || (found.isDefault && !draft.isDefault)) return current;
      const isDefault = current.length === 1 || draft.isDefault;
      return current.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            name: draft.name.trim(),
            phone: draft.phone.trim(),
            address: draft.address.trim(),
            detail: draft.detail.trim(),
            postalCode: draft.postalCode.trim(),
            isDefault,
          };
        }
        return isDefault ? { ...item, isDefault: false } : item;
      });
    });
    return "ok" as const;
  }, [addresses]);

  const removeAddress = useCallback((id: string) => {
    const target = addresses.find((item) => item.id === id);
    if (!target) return "missing" as const;
    if (target.isDefault) return "keep-default" as const;
    setAddresses((current) => {
      const found = current.find((item) => item.id === id);
      if (!found || found.isDefault) return current;
      return current.filter((item) => item.id !== id);
    });
    return "ok" as const;
  }, [addresses]);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((current) => {
      if (!current.some((item) => item.id === id)) return current;
      return current.map((item) => ({ ...item, isDefault: item.id === id }));
    });
  }, []);

  const placeOrder = useCallback((order: Order) => {
    setOrders((current) => [order, ...current]);
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, ...patch } : order)));
  }, []);

  const requestCancel = useCallback((id: string, reason: string, detail: string) => {
    setOrders((current) => {
      const target = current.find((order) => order.id === id);
      if (!target || target.cancelRequest) return current;
      if (target.status !== "결제완료" && target.status !== "배송완료") return current;
      return current.map((order) =>
        order.id === id
          ? {
              ...order,
              cancelRequest: {
                reason,
                detail,
                requestedAt: new Date().toISOString(),
              },
            }
          : order,
      );
    });
  }, []);

  useEffect(() => {
    setOrders((current) => expireCancelRequests(current));
  }, [orders]);

  const sendTimes = useRef<number[]>([]);
  const [chatPausedUntil, setChatPausedUntil] = useState(0);

  const ensureRoom = useCallback((product: Product) => {
    const until = user ? getShared().suspendedUntil[user.email] ?? getShared().suspendedUntil[user.name] : undefined;
    if (until && new Date(until).getTime() > Date.now()) {
      notify("활동 정지 중에는 채팅방을 만들 수 없어요.");
      return null;
    }
    const seller = getSeller(product.sellerId);
    const existing = rooms.find((room) => room.productId === product.id);
    if (existing) return existing.id;

    const id = `room-${product.id}`;
    const room: ChatRoom = {
      id,
      productId: product.id,
      sellerName: seller.name,
      sellerHandle: seller.handle,
      sellerEmail: sellerAccount(product.sellerId).email,
      buyerName: user?.name,
      buyerEmail: user?.email,
      activity: "활성",
      updatedAt: new Date().toISOString(),
      unread: 0,
      messages: [
        {
          id: `hello-${id}`,
          sender: "seller",
          text: `안녕하세요. ${product.title} 보고 오셨어요? 궁금한 점 편하게 남겨 주세요.`,
          at: formatTime(),
        },
      ],
    };
    setRooms((current) => (current.some((item) => item.productId === product.id) ? current : [room, ...current]));
    return id;
  }, [notify, rooms, user]);

  const startPurchase = useCallback((product: Product) => {
    const until = user ? getShared().suspendedUntil[user.email] ?? getShared().suspendedUntil[user.name] : undefined;
    if (until && new Date(until).getTime() > Date.now()) {
      notify("활동 정지 중에는 채팅방을 만들 수 없어요.");
      return null;
    }
    if (product.sellerId === "me") {
      notify("내 상품에는 구매 신청을 보낼 수 없어요.");
      return null;
    }
    const seller = getSeller(product.sellerId);
    const roomId = rooms.find((room) => room.productId === product.id)?.id ?? `room-${product.id}`;
    if (product.saleStatus !== "판매중") {
      setRooms((current) => {
        if (current.some((item) => item.productId === product.id)) return current;
        return [{
          id: roomId,
          productId: product.id,
          sellerName: seller.name,
          sellerHandle: seller.handle,
          sellerEmail: sellerAccount(product.sellerId).email,
          buyerName: user?.name,
          buyerEmail: user?.email,
          activity: "활성" as const,
          updatedAt: new Date().toISOString(),
          unread: 0,
          messages: [{ id: `hello-${roomId}`, sender: "seller" as const, text: `안녕하세요. ${product.title} 보고 오셨어요? 궁금한 점 편하게 남겨 주세요.`, at: formatTime() }],
        }, ...current];
      });
      notify("판매중인 상품만 구매 신청할 수 있어요. 채팅방만 열었습니다.");
      return roomId;
    }
    const card: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "me",
      kind: "purchase",
      at: formatTime(),
      text: `${product.title} · ${formatPrice(product.price)}`,
    };
    let already = false;
    setRooms((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing?.purchase && ["대기", "승인", "결제완료"].includes(existing.purchase.status)) {
        already = true;
        return current;
      }
      if (existing) {
        return current.map((item) =>
          item.id === existing.id
            ? { ...item, messages: [...item.messages, card], purchase: { status: "대기" as const, requestedAt: new Date().toISOString() } }
            : item,
        );
      }
      return [{
        id: roomId,
        productId: product.id,
        sellerName: seller.name,
        sellerHandle: seller.handle,
        sellerEmail: sellerAccount(product.sellerId).email,
        buyerName: user?.name,
        buyerEmail: user?.email,
        activity: "활성" as const,
        updatedAt: new Date().toISOString(),
        unread: 0,
        purchase: { status: "대기" as const, requestedAt: new Date().toISOString() },
        messages: [
          { id: `hello-${roomId}`, sender: "seller" as const, text: `안녕하세요. ${product.title} 보고 오셨어요? 궁금한 점 편하게 남겨 주세요.`, at: formatTime() },
          card,
        ],
      }, ...current];
    });
    notify(already ? "이미 진행 중인 구매 신청이 있어요." : "판매자에게 구매 신청 카드를 보냈어요.");
    return roomId;
  }, [notify, rooms, user]);

  const sendMessage = useCallback((roomId: string, message: Pick<ChatMessage, "text" | "imageUrl"> & { sender?: ChatMessage["sender"] }) => {
    const now = Date.now();
    if (now < chatPausedUntil) {
      notify("메시지를 너무 빠르게 보내 10초 동안 전송이 멈춰 있어요.");
      return;
    }
    sendTimes.current = [...sendTimes.current.filter((time) => now - time < 1000), now];
    if (sendTimes.current.length >= 5) {
      setChatPausedUntil(now + 10_000);
      notify("1초 안에 5회 전송되어 10초 동안 채팅이 정지됩니다.");
      return;
    }
    const sender = message.sender ?? "me";
    const warned = Boolean(message.text && /계좌|카톡|카카오|010-?\d|개인정보|외부결제/.test(message.text));
    const mine: ChatMessage = {
      id: crypto.randomUUID(),
      sender,
      at: formatTime(),
      text: message.text,
      imageUrl: message.imageUrl,
    };
    const warning: ChatMessage | null = warned
      ? { id: crypto.randomUUID(), sender: "seller", at: formatTime(), text: "외부결제나 개인정보 전송은 경고 1회가 누적됩니다. Spark 안전결제를 이용해 주세요." }
      : null;
    setRooms((current) =>
      current.map((room) =>
        room.id === roomId ? { ...room, updatedAt: new Date().toISOString(), messages: [...room.messages, ...(warning ? [warning] : []), mine] } : room,
      ),
    );
    if (sender !== "me") return;
    const counterpart = rooms.find((item) => item.id === roomId)?.sellerName ?? "상대";
    setTypingRoomId(roomId);

    const replyText = message.imageUrl
      ? "사진 잘 봤어요. 이어서 확인해 볼게요."
      : message.text && /^[\s✨💖🧸😊🙌🎀😭⚡]+$/.test(message.text)
        ? "ㅎㅎ 궁금한 점 있으면 글로도 남겨 주세요."
        : SELLER_REPLIES[replyCursor.current % SELLER_REPLIES.length];
    replyCursor.current += 1;

    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "seller",
        at: formatTime(),
        text: replyText,
      };
      setRooms((current) =>
        current.map((room) => (room.id === roomId ? { ...room, updatedAt: new Date().toISOString(), messages: [...room.messages, reply] } : room)),
      );
      setTypingRoomId((current) => (current === roomId ? null : current));
      pushNotice({
        kind: "채팅",
        text: `${counterpart}님의 채팅 메시지가 도착했습니다.`,
        href: `/chat/${roomId}`,
      });
    }, 900);
  }, [chatPausedUntil, notify, pushNotice, rooms]);

  const requestPurchase = useCallback((roomId: string) => {
    const room = rooms.find((item) => item.id === roomId);
    const product = room ? records.find((item) => item.id === room.productId && !item.deletedAt) : undefined;
    if (!room || !product || product.saleStatus !== "판매중") {
      notify("판매중인 상품만 구매 신청할 수 있어요.");
      return;
    }
    if (room.purchase?.status === "대기" || room.purchase?.status === "승인") {
      notify("이미 진행 중인 구매 신청이 있어요.");
      return;
    }
    const note: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "me",
      kind: "purchase",
      at: formatTime(),
      text: `${product.title} · ${formatPrice(product.price)}`,
    };
    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? { ...item, messages: [...item.messages, note], purchase: { status: "대기", requestedAt: new Date().toISOString() } }
          : item,
      ),
    );
    notify("구매 신청을 보냈어요. 판매자 역할로 전환하면 승인 창이 열립니다.");
  }, [notify, records, rooms]);

  const decidePurchase = useCallback((roomId: string, accept: boolean, sellerAddress: string, sellerAccount: string) => {
    const room = rooms.find((item) => item.id === roomId);
    const product = room ? records.find((item) => item.id === room.productId && !item.deletedAt) : undefined;
    if (!room || !product || room.purchase?.status !== "대기") return;
    const vip = Boolean(user?.membership === "vip" && product.sellerId === "me");
    const money = settlementOf(product.price, vip);
    const text = accept ? "구매 신청을 승인했습니다. 결제 정보를 입력해 주세요." : "구매 신청을 거절했습니다.";
    const note: ChatMessage = { id: crypto.randomUUID(), sender: "seller", at: formatTime(), text };
    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? {
              ...item,
              messages: [...item.messages, note],
              purchase: accept
                ? { status: "승인", requestedAt: item.purchase?.requestedAt ?? new Date().toISOString(), sellerAddress, sellerAccount, feeRate: money.feeRate, payout: money.payoutAmount }
                : { status: "거절", requestedAt: item.purchase?.requestedAt ?? new Date().toISOString() },
            }
          : item,
      ),
    );
    notify(accept ? "구매를 승인했어요. 구매자 역할에서 결제를 진행해 주세요." : "구매 신청을 거절했어요. 상품은 판매중으로 유지됩니다.");
  }, [notify, records, rooms, user?.membership]);

  const completePurchase = useCallback((roomId: string, payment: { address: string; customsNumber: string; paymentMethod: string }) => {
    const room = rooms.find((item) => item.id === roomId);
    const product = room ? records.find((item) => item.id === room.productId && !item.deletedAt) : undefined;
    if (!room || !product || room.purchase?.status !== "승인") return null;
    const vip = product.sellerId === "me" && user?.membership === "vip";
    const money = settlementOf(product.price, Boolean(vip));
    const orderId = `SPK-${Date.now().toString().slice(-8)}`;
    const base = {
      productId: product.id,
      title: product.title,
      ip: product.ip,
      price: product.price,
      itemPrice: product.price,
      shippingFee: product.shippingFee,
      quantity: 1,
      condition: product.condition,
      motif: product.motif,
      palette: product.palette,
      imageUrl: product.imageUrl,
      status: "결제완료" as const,
      orderedAt: "2026.11.10",
      address: payment.address,
      paymentMethod: payment.paymentMethod,
      ownerEmail: user?.email,
      tracking: null,
      review: null,
      customsNumber: payment.customsNumber,
      pgStatus: "예치완료" as const,
      priceLocked: true,
      feeRate: money.feeRate,
      feeAmount: money.feeAmount,
      payoutAmount: money.payoutAmount,
    };
    const seller = getSeller(product.sellerId);
    setOrders((current) => [
      { ...base, id: `${orderId}-B`, role: "purchase", counterpart: seller.name },
      { ...base, id: `${orderId}-S`, role: "sale", counterpart: user?.name ?? "구매자" },
      ...current,
    ]);
    setRecords((current) =>
      current.map((item) => (item.id === product.id ? { ...item, saleStatus: "예약중" } : item)),
    );
    const note: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "me",
      at: formatTime(),
      text: "결제가 완료되어 PG사에 예치되었습니다. 상품 금액과 수수료율이 이 시점에 고정됩니다.",
    };
    setRooms((current) =>
      current.map((item) =>
        item.id === roomId
          ? { ...item, messages: [...item.messages, note], purchase: { ...item.purchase!, status: "결제완료" } }
          : item,
      ),
    );
    notify("결제가 완료되어 예치되었어요. 상품은 예약중이 되었습니다.");
    pushNotice({
      kind: "거래",
      text: `${product.title} 상품 결제가 완료되었습니다.`,
      href: `/orders/${orderId}-B`,
    });
    return orderId;
  }, [notify, pushNotice, records, rooms, user?.email, user?.membership, user?.name]);

  const markRead = useCallback((roomId: string) => {
    setRooms((current) => {
      const room = current.find((item) => item.id === roomId);
      if (!room || room.unread === 0) return current;
      return current.map((item) => (item.id === roomId ? { ...item, unread: 0 } : item));
    });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    setRooms((current) => current.filter((room) => room.id !== roomId));
    notify("채팅방에서 나갔어요.");
  }, [notify]);

  const addBank = useCallback((draft: Omit<BankAccount, "id">) => {
    if (banks.length >= BANK_LIMIT) return "limit" as const;
    const account: BankAccount = { ...draft, id: crypto.randomUUID() };
    setBanks((current) => {
      const next = draft.isDefault ? current.map((item) => ({ ...item, isDefault: false })) : current;
      return [...next, account];
    });
    notify("계좌를 저장했어요.");
    return "ok" as const;
  }, [banks.length, notify]);

  const removeBank = useCallback((id: string) => {
    setBanks((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateProfile = useCallback((patch: { name?: string; photoUrl?: string }) => {
    if (!user) return;
    const next = { ...user, ...patch };
    setUser(next);
    setAccounts((current) => current.map((account) => (account.email === user.email ? { ...account, name: next.name, photoUrl: next.photoUrl } : account)));
    notify("프로필을 저장했어요.");
  }, [notify, user]);

  const requestResetCode = useCallback((email: string) => {
    const found = accounts.some((account) => account.email === email && !account.withdrawn);
    if (!found) return false;
    notify(`인증번호가 발송되었습니다. 테스트 번호는 ${TEST_VERIFICATION_CODE}입니다.`);
    return true;
  }, [accounts, notify]);

  const resetPassword = useCallback((email: string, code: string, nextPassword: string) => {
    if (code !== TEST_VERIFICATION_CODE) return false;
    const found = accounts.find((account) => account.email === email && !account.withdrawn && account.provider === "email");
    if (!found) return false;
    setAccounts((current) => current.map((account) => (account.email === email ? { ...account, password: nextPassword } : account)));
    notify("비밀번호를 바꿨어요.");
    return true;
  }, [accounts, notify]);

  const changePassword = useCallback((email: string, currentPassword: string, code: string, nextPassword: string) => {
    if (code !== TEST_VERIFICATION_CODE) return false;
    const found = accounts.find((account) => account.email === email && account.password === currentPassword && !account.withdrawn);
    if (!found) return false;
    setAccounts((current) => current.map((account) => (account.email === email ? { ...account, password: nextPassword } : account)));
    notify("비밀번호를 바꿨어요.");
    return true;
  }, [accounts, notify]);

  const withdraw = useCallback((password: string) => {
    if (!user) return "guest" as const;
    const account = accounts.find((item) => item.email === user.email);
    const confirmed = account?.provider === "email" ? account.password === password : password === user.email;
    if (!confirmed) return "bad-password" as const;
    const hasTrades = orders.some((order) => order.ownerEmail === user.email);
    const retainUntil = hasTrades ? new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : null;
    setAccounts((current) =>
      current.map((item) =>
        item.email === user.email
          ? { ...item, withdrawn: true, password: "", name: "deleted", photoUrl: undefined }
          : item,
      ),
    );
    setRetention({
      hasTrades,
      retainUntil,
      token: hasTrades ? `enc:${user.email.length}:${user.email.slice(0, 2)}` : "",
    });
    clearStoredAuth();
    setUser(null);
    notify(hasTrades ? "탈퇴했습니다. 거래 기록은 5년 보관 후 삭제됩니다." : "거래 내역이 없어 계정을 즉시 삭제했습니다.");
    return "ok" as const;
  }, [accounts, notify, orders, user]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    applyRetentionPolicy();
  }, []);

  useEffect(() => {
    if (shared.purgedProductIds.length === 0) return;
    setRecords((current) => current.filter((item) => !shared.purgedProductIds.includes(item.id)));
  }, [shared.purgedProductIds]);

  useEffect(() => {
    for (const id of shared.deletedProductIds) {
      const product = records.find((item) => item.id === id);
      if (product && !product.deletedAt && product.saleStatus !== "예약중") softDeleteProduct(id);
    }
  }, [records, shared.deletedProductIds, softDeleteProduct]);

  const value: SparkContextValue = {
    user,
    login,
    logout,
    isEmailTaken,
    findAccount,
    registerAccount,
    authenticate,
    activateMembership,
    wishlistIds,
    toggleWishlist,
    products,
    isProductDeleted,
    addProduct,
    updateProduct,
    softDeleteProduct,
    addresses,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    orders,
    placeOrder,
    updateOrder,
    requestCancel,
    rooms,
    typingRoomId,
    ensureRoom,
    startPurchase,
    sendMessage,
    requestPurchase,
    decidePurchase,
    completePurchase,
    markRead,
    leaveRoom,
    notify,
    locale,
    setLocale,
    banks,
    addBank,
    removeBank,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    notifyMode,
    setNotifyMode,
    updateProfile,
    requestResetCode,
    resetPassword,
    changePassword,
    withdraw,
    retention,
  };

  return (
    <SparkContext.Provider value={value}>
      {children}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </SparkContext.Provider>
  );
}

export function useSpark() {
  const context = useContext(SparkContext);
  if (!context) {
    throw new Error("SparkProvider가 필요합니다.");
  }
  return context;
}
