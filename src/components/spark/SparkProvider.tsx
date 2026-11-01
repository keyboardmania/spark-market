"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ADDRESS_LIMIT,
  CHAT_ROOMS,
  ORDERS,
  PRODUCTS,
  SELLER_REPLIES,
  formatTime,
  getSeller,
  type AddressDraft,
  type ChatMessage,
  type ChatRoom,
  type Order,
  type Product,
  type ShippingAddress,
  type SparkUser,
} from "@/data/mockData";

type StoredAccount = {
  name: string;
  email: string;
  password: string;
  provider: SparkUser["provider"];
  membership?: SparkUser["membership"];
};

const RESERVED_EMAILS = new Set(["taken@spark.market"]);

type SparkContextValue = {
  user: SparkUser | null;
  login: (user: SparkUser) => void;
  logout: () => void;
  isEmailTaken: (email: string) => boolean;
  findAccount: (email: string) => SparkUser | null;
  registerAccount: (account: StoredAccount) => void;
  authenticate: (email: string, password: string) => SparkUser | null;
  activateMembership: () => boolean;
  cartIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
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
  ensureRoom: (product: Product) => string;
  sendMessage: (roomId: string, message: Pick<ChatMessage, "text" | "imageUrl">) => void;
  markRead: (roomId: string) => void;
  notify: (message: string) => void;
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
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [records, setRecords] = useState<Array<Product & { deletedAt: string | null }>>(() =>
    PRODUCTS.map((product) => ({ ...product, deletedAt: null })),
  );
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

  const products = useMemo(
    () =>
      records
        .filter((product) => product.deletedAt === null)
        .map(({ deletedAt: _deletedAt, ...product }) => product),
    [records],
  );

  const login = useCallback((next: SparkUser) => {
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

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
      if (!found) return null;
      return { name: found.name, email: found.email, provider: found.provider, membership: found.membership };
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
      if (!found || found.provider !== "email" || !found.password || found.password !== password) return null;
      return { name: found.name, email: found.email, provider: "email", membership: found.membership };
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

  const addToCart = useCallback(
    (id: string) => {
      if (cartIds.includes(id)) {
        notify("이미 장바구니에 담긴 상품이에요.");
        return;
      }
      setCartIds((current) => [...current, id]);
      notify("장바구니에 담았어요.");
    },
    [cartIds, notify],
  );

  const removeFromCart = useCallback((id: string) => {
    setCartIds((current) => current.filter((item) => item !== id));
  }, []);

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
    setRecords((current) => [{ ...product, deletedAt: null }, ...current.filter((item) => item.id !== product.id)]);
  }, []);

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      const current = records.find((product) => product.id === id);
      if (!current || current.deletedAt || current.saleStatus === "판매완료") return false;
      setRecords((items) =>
        items.map((item) =>
          item.id === id ? { ...item, ...patch, id: item.id, sellerId: item.sellerId, deletedAt: null } : item,
        ),
      );
      return true;
    },
    [records],
  );

  const softDeleteProduct = useCallback((id: string) => {
    const deletedAt = new Date().toISOString();
    setRecords((current) => current.map((item) => (item.id === id ? { ...item, deletedAt } : item)));
    setCartIds((current) => current.filter((item) => item !== id));
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
    setCartIds((current) => current.filter((id) => id !== order.productId));
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

  useLayoutEffect(() => {
    setOrders((current) => expireCancelRequests(current));
  }, [orders]);

  const ensureRoom = useCallback((product: Product) => {
    const seller = getSeller(product.sellerId);
    const existing = rooms.find((room) => room.productId === product.id);
    if (existing) return existing.id;

    const id = `room-${product.id}`;
    const room: ChatRoom = {
      id,
      productId: product.id,
      sellerName: seller.name,
      sellerHandle: seller.handle,
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
  }, [rooms]);

  const sendMessage = useCallback((roomId: string, message: Pick<ChatMessage, "text" | "imageUrl">) => {
    const mine: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "me",
      at: formatTime(),
      text: message.text,
      imageUrl: message.imageUrl,
    };
    setRooms((current) =>
      current.map((room) => (room.id === roomId ? { ...room, messages: [...room.messages, mine] } : room)),
    );
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
        current.map((room) => (room.id === roomId ? { ...room, messages: [...room.messages, reply] } : room)),
      );
      setTypingRoomId((current) => (current === roomId ? null : current));
    }, 900);
  }, []);

  const markRead = useCallback((roomId: string) => {
    setRooms((current) => {
      const room = current.find((item) => item.id === roomId);
      if (!room || room.unread === 0) return current;
      return current.map((item) => (item.id === roomId ? { ...item, unread: 0 } : item));
    });
  }, []);

  const value: SparkContextValue = {
    user,
    login,
    logout,
    isEmailTaken,
    findAccount,
    registerAccount,
    authenticate,
    activateMembership,
    cartIds,
    addToCart,
    removeFromCart,
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
    sendMessage,
    markRead,
    notify,
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
