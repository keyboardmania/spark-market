"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CHAT_ROOMS,
  ORDERS,
  PRODUCTS,
  SELLER_REPLIES,
  formatTime,
  getSeller,
  type ChatMessage,
  type ChatRoom,
  type Order,
  type Product,
  type SparkUser,
} from "@/data/mockData";

type SparkContextValue = {
  user: SparkUser | null;
  adultVerified: boolean;
  login: (user: SparkUser) => void;
  logout: () => void;
  verifyAdult: () => void;
  cartIds: string[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  orders: Order[];
  placeOrder: (order: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  rooms: ChatRoom[];
  typingRoomId: string | null;
  ensureRoom: (product: Product) => string;
  sendMessage: (roomId: string, message: Pick<ChatMessage, "text" | "imageUrl">) => void;
  markRead: (roomId: string) => void;
  notify: (message: string) => void;
};

const SparkContext = createContext<SparkContextValue | null>(null);

export function SparkProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SparkUser | null>(null);
  const [adultVerified, setAdultVerified] = useState(false);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
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

  const products = useMemo(() => {
    const customIds = new Set(customProducts.map((product) => product.id));
    return [...customProducts, ...PRODUCTS.filter((product) => !customIds.has(product.id))];
  }, [customProducts]);

  const login = useCallback((next: SparkUser) => {
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const verifyAdult = useCallback(() => {
    setAdultVerified(true);
  }, []);

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

  const addProduct = useCallback((product: Product) => {
    setCustomProducts((current) => [product, ...current]);
  }, []);

  const placeOrder = useCallback((order: Order) => {
    setOrders((current) => [order, ...current]);
    setCartIds((current) => current.filter((id) => id !== order.productId));
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, ...patch } : order)));
  }, []);

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
    adultVerified,
    login,
    logout,
    verifyAdult,
    cartIds,
    addToCart,
    removeFromCart,
    wishlistIds,
    toggleWishlist,
    products,
    addProduct,
    orders,
    placeOrder,
    updateOrder,
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
