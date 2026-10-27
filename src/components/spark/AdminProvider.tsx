"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_ACCOUNTS,
  ADMIN_CATEGORIES,
  ADMIN_DEMO,
  ADMIN_INQUIRIES,
  ADMIN_MEMBERS,
  ADMIN_REPORTS,
  ADMIN_SETTLEMENTS,
  ADMIN_TRADES,
  PRODUCTS,
  type AdminAccount,
  type AdminCategory,
  type AdminInquiry,
  type AdminMember,
  type AdminReport,
  type AdminSettlement,
  type AdminTrade,
  type AdminTradeStatus,
  type Product,
  type ReportStatus,
} from "@/data/mockData";

export type AdminSession = {
  name: string;
  email: string;
  role: AdminAccount["role"];
};

const ADMIN_SESSION_KEY = "spark-admin-session";

export type AdminLoginFailure = {
  ok: false;
  field: "email" | "password" | "session";
  message: string;
};

export type AdminLoginResult = { ok: true } | AdminLoginFailure;

type AdminContextValue = {
  ready: boolean;
  session: AdminSession | null;
  login: (email: string, password: string) => AdminLoginResult;
  logout: () => void;
  members: AdminMember[];
  setSuspended: (id: string, suspended: boolean) => void;
  products: Product[];
  removeProduct: (id: string) => void;
  categories: AdminCategory[];
  addCategory: (name: string) => void;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  trades: AdminTrade[];
  setTradeStatus: (id: string, status: AdminTradeStatus) => void;
  settlements: AdminSettlement[];
  approveSettlement: (id: string) => void;
  inquiries: AdminInquiry[];
  replyInquiry: (id: string, reply: string) => void;
  reports: AdminReport[];
  setReportStatus: (id: string, status: ReportStatus) => void;
  admins: AdminAccount[];
};

const AdminContext = createContext<AdminContextValue | null>(null);

function readStoredSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    const account = ADMIN_ACCOUNTS.find((item) => item.email === parsed.email);
    if (!account || parsed.role !== account.role) return null;
    return { name: account.name, email: account.email, role: account.role };
  } catch (error) {
    console.error("[Spark admin] 저장된 관리자 세션을 읽지 못했어요.", error);
    return null;
  }
}

function storeSession(session: AdminSession): AdminLoginFailure | null {
  if (typeof window === "undefined") {
    return {
      ok: false,
      field: "session",
      message: "로그인 상태를 브라우저에 저장하지 못했어요. 저장소를 허용한 뒤 다시 시도해 주세요.",
    };
  }
  try {
    window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    return null;
  } catch (error) {
    console.error("[Spark admin login] localStorage에 세션을 저장하지 못했어요.", error);
    return {
      ok: false,
      field: "session",
      message: "로그인 상태를 브라우저에 저장하지 못했어요. 저장소를 허용한 뒤 다시 시도해 주세요.",
    };
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [members, setMembers] = useState(ADMIN_MEMBERS);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);
  const [trades, setTrades] = useState(ADMIN_TRADES);
  const [settlements, setSettlements] = useState(ADMIN_SETTLEMENTS);
  const [inquiries, setInquiries] = useState(ADMIN_INQUIRIES);
  const [reports, setReports] = useState(ADMIN_REPORTS);

  useEffect(() => {
    setSession(readStoredSession());
    setReady(true);
  }, []);

  const products = useMemo(
    () => PRODUCTS.filter((product) => !removedIds.includes(product.id)),
    [removedIds],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      ready,
      session,
      login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();
        if (!normalizedEmail) {
          return fail("email", "이메일을 입력해 주세요.");
        }
        if (!normalizedEmail.includes("@")) {
          return fail("email", "이메일 형식이 올바르지 않아요.");
        }
        const account = ADMIN_ACCOUNTS.find((item) => item.email === normalizedEmail);
        if (!account) {
          return fail("email", "등록되지 않은 관리자 이메일이에요.");
        }
        if (!normalizedPassword) {
          return fail("password", "비밀번호를 입력해 주세요.");
        }
        if (normalizedPassword !== ADMIN_DEMO.password) {
          return fail("password", "비밀번호가 올바르지 않아요.");
        }
        const next = { name: account.name, email: account.email, role: account.role };
        const stored = storeSession(next);
        if (stored) return stored;
        setSession(next);
        return { ok: true };
      },
      logout() {
        if (typeof window !== "undefined") {
          try {
            window.localStorage.removeItem(ADMIN_SESSION_KEY);
          } catch (error) {
            console.error("[Spark admin] 저장된 세션을 지우지 못했어요.", error);
          }
        }
        setSession(null);
      },
      members,
      setSuspended(id, suspended) {
        setMembers((current) => current.map((member) => (member.id === id ? { ...member, suspended } : member)));
      },
      products,
      removeProduct(id) {
        setRemovedIds((current) => (current.includes(id) ? current : [...current, id]));
      },
      categories,
      addCategory(name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        setCategories((current) => [
          ...current,
          { id: `cat-${current.length + 1}-${trimmed.length}`, name: trimmed, slug: `custom-${current.length + 1}` },
        ]);
      },
      updateCategory(id, name) {
        const trimmed = name.trim();
        if (!trimmed) return;
        setCategories((current) => current.map((category) => (category.id === id ? { ...category, name: trimmed } : category)));
      },
      deleteCategory(id) {
        setCategories((current) => current.filter((category) => category.id !== id));
      },
      trades,
      setTradeStatus(id, status) {
        setTrades((current) => current.map((trade) => (trade.id === id ? { ...trade, status } : trade)));
      },
      settlements,
      approveSettlement(id) {
        setSettlements((current) =>
          current.map((item) => (item.id === id ? { ...item, status: "승인완료" } : item)),
        );
      },
      inquiries,
      replyInquiry(id, reply) {
        const text = reply.trim();
        if (!text) return;
        setInquiries((current) =>
          current.map((item) => (item.id === id ? { ...item, reply: text, status: "답변완료" } : item)),
        );
      },
      reports,
      setReportStatus(id, status) {
        setReports((current) => current.map((report) => (report.id === id ? { ...report, status } : report)));
      },
      admins: ADMIN_ACCOUNTS,
    }),
    [ready, session, members, products, categories, trades, settlements, inquiries, reports],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

function fail(field: AdminLoginFailure["field"], message: string): AdminLoginFailure {
  console.error(`[Spark admin login] ${field}: ${message}`);
  return { ok: false, field, message };
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
