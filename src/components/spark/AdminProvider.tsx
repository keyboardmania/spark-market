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
  type AdminCategoryKind,
  type AdminInquiry,
  type AdminMember,
  type AdminReport,
  type AdminRole,
  type AdminSettlement,
  type AdminTrade,
  type AdminTradeStatus,
  type Product,
  type ReportStatus,
} from "@/data/mockData";

export type AdminSession = {
  loginId: string;
  email: string;
  role: AdminRole;
};

const ADMIN_SESSION_KEY = "spark-admin-session";
const ADMIN_ACCOUNTS_KEY = "spark-admin-accounts";

export type AdminLoginFailure = {
  ok: false;
  field: "loginId" | "password" | "session";
  message: string;
};

export type AdminLoginResult = { ok: true } | AdminLoginFailure;

export type CreateAdminInput = {
  loginId: string;
  email: string;
  role: AdminRole;
  password: string;
  verifyCode: string;
};

type AdminContextValue = {
  ready: boolean;
  session: AdminSession | null;
  login: (loginId: string, password: string) => AdminLoginResult;
  logout: () => void;
  members: AdminMember[];
  setSuspended: (id: string, suspended: boolean) => void;
  products: Product[];
  removeProduct: (id: string) => void;
  categories: AdminCategory[];
  addCategory: (input: { name: string; kind: AdminCategoryKind; parentId?: string | null }) => string | null;
  updateCategory: (id: string, name: string) => string | null;
  deleteCategory: (id: string, productCount: number, postCount?: number) => string | null;
  trades: AdminTrade[];
  setTradeStatus: (id: string, status: AdminTradeStatus) => void;
  settlements: AdminSettlement[];
  approveSettlement: (id: string) => void;
  inquiries: AdminInquiry[];
  replyInquiry: (id: string, reply: string) => void;
  reports: AdminReport[];
  setReportStatus: (id: string, status: ReportStatus) => void;
  admins: AdminAccount[];
  createAdmin: (input: CreateAdminInput) => { ok: true } | { ok: false; message: string };
};

const AdminContext = createContext<AdminContextValue | null>(null);

function readStoredAdmins(): AdminAccount[] {
  if (typeof window === "undefined") return ADMIN_ACCOUNTS;
  try {
    const raw = window.localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    if (!raw) return ADMIN_ACCOUNTS;
    const parsed = JSON.parse(raw) as AdminAccount[];
    if (!Array.isArray(parsed) || parsed.length === 0) return ADMIN_ACCOUNTS;
    return parsed;
  } catch {
    return ADMIN_ACCOUNTS;
  }
}

function persistAdmins(admins: AdminAccount[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(admins));
  } catch (error) {
    console.error("[Spark admin] 운영자 목록을 저장하지 못했어요.", error);
  }
}

function readStoredSession(admins: AdminAccount[]): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    const account = admins.find((item) => item.loginId === parsed.loginId || item.email === parsed.email);
    if (!account || account.status === "정지" || parsed.role !== account.role) return null;
    return { loginId: account.loginId, email: account.email, role: account.role };
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

function sameName(a: string, b: string) {
  return a.localeCompare(b, "en", { sensitivity: "base" }) === 0;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [admins, setAdmins] = useState<AdminAccount[]>(ADMIN_ACCOUNTS);
  const [members, setMembers] = useState(ADMIN_MEMBERS);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState(ADMIN_CATEGORIES);
  const [trades, setTrades] = useState(ADMIN_TRADES);
  const [settlements, setSettlements] = useState(ADMIN_SETTLEMENTS);
  const [inquiries, setInquiries] = useState(ADMIN_INQUIRIES);
  const [reports, setReports] = useState(ADMIN_REPORTS);

  useEffect(() => {
    const nextAdmins = readStoredAdmins();
    setAdmins(nextAdmins);
    setSession(readStoredSession(nextAdmins));
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
      login(loginId, password) {
        const normalizedId = loginId.trim().toLowerCase();
        const normalizedPassword = password.trim();
        const account = admins.find((item) => item.loginId.toLowerCase() === normalizedId);
        if (!normalizedId || !normalizedPassword || !account || normalizedPassword !== ADMIN_DEMO.password) {
          return fail("session", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (account.status === "정지") {
          return fail("session", "정지된 관리자 계정입니다.");
        }
        const next = { loginId: account.loginId, email: account.email, role: account.role };
        const stored = storeSession(next);
        if (stored) return stored;
        setSession(next);
        setAdmins((current) => {
          const stamped = current.map((item) =>
            item.id === account.id
              ? { ...item, lastSeen: new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date()).replace(/\. /g, ".").replace(/\.$/, "") }
              : item,
          );
          persistAdmins(stamped);
          return stamped;
        });
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
        setMembers((current) =>
          current.map((member) => {
            if (member.id !== id) return member;
            if (!suspended) return { ...member, suspended: false };
            const now = new Date();
            const release = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const stamp = (date: Date) =>
              new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                .format(date)
                .replace(/\. /g, ".")
                .replace(/\.$/, "");
            return { ...member, suspended: true, suspendedAt: stamp(now), releasedAt: stamp(release) };
          }),
        );
      },
      products,
      removeProduct(id) {
        setRemovedIds((current) => (current.includes(id) ? current : [...current, id]));
      },
      categories,
      addCategory({ name, kind, parentId = null }) {
        const trimmed = name.trim();
        if (!trimmed) return "이름을 입력해 주세요.";
        let error: string | null = null;
        setCategories((current) => {
          const live = current.filter((item) => !item.deletedAt && item.kind === kind);
          if (parentId) {
            let depth = 1;
            let cursor: string | null = parentId;
            while (cursor) {
              depth += 1;
              cursor = live.find((item) => item.id === cursor)?.parentId ?? null;
            }
            if (depth > 4) {
              error = "카테고리는 4단계까지만 만들 수 있어요.";
              return current;
            }
          }
          if (live.some((item) => item.parentId === parentId && sameName(item.name, trimmed))) {
            error = "동일 상위 카테고리 안에 같은 이름은 등록할 수 없어요.";
            return current;
          }
          const next: AdminCategory = {
            id: `cat-${kind}-${Date.now()}`,
            kind,
            name: trimmed,
            slug: `custom-${current.length + 1}`,
            parentId,
            deletedAt: null,
          };
          // 새 항목은 동일 상위 목록의 맨 위에 둡니다.
          return [next, ...current];
        });
        return error;
      },
      updateCategory(id, name) {
        const trimmed = name.trim();
        if (!trimmed) return "이름을 입력해 주세요.";
        let error: string | null = null;
        setCategories((current) => {
          const target = current.find((item) => item.id === id);
          if (!target || target.deletedAt) return current;
          const duplicate = current.some(
            (item) =>
              item.id !== id &&
              !item.deletedAt &&
              item.kind === target.kind &&
              item.parentId === target.parentId &&
              sameName(item.name, trimmed),
          );
          if (duplicate) {
            error = "동일 상위 카테고리 안에 같은 이름은 등록할 수 없어요.";
            return current;
          }
          return current.map((category) => (category.id === id ? { ...category, name: trimmed } : category));
        });
        return error;
      },
      deleteCategory(id, productCount, postCount = 0) {
        let error: string | null = null;
        setCategories((current) => {
          const target = current.find((item) => item.id === id);
          if (!target || target.deletedAt) return current;
          const hasChildren = current.some((item) => item.parentId === id && !item.deletedAt);
          if (hasChildren) {
            error = "하위 카테고리가 있으면 삭제할 수 없어요.";
            return current;
          }
          if (productCount > 0 || postCount > 0) {
            error = target.kind === "product"
              ? "등록된 상품이 있는 카테고리는 삭제할 수 없어요."
              : "등록된 게시글이 있는 카테고리는 삭제할 수 없어요.";
            return current;
          }
          const deletedAt = new Date().toISOString();
          return current.map((item) => (item.id === id ? { ...item, deletedAt } : item));
        });
        return error;
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
      admins,
      createAdmin(input) {
        if (session?.role !== "슈퍼 관리자") {
          return { ok: false as const, message: "슈퍼 관리자만 운영자를 등록할 수 있어요." };
        }
        const loginId = input.loginId.trim();
        const email = input.email.trim().toLowerCase();
        if (!loginId || !email || !input.password.trim()) {
          return { ok: false as const, message: "아이디, 이메일, 비밀번호를 모두 입력해 주세요." };
        }
        if (input.verifyCode.trim() !== ADMIN_DEMO.verifyCode) {
          return { ok: false as const, message: "이메일 인증 코드가 올바르지 않아요." };
        }
        if (admins.some((item) => item.loginId.toLowerCase() === loginId.toLowerCase())) {
          return { ok: false as const, message: "이미 사용 중인 관리자 아이디예요." };
        }
        if (admins.some((item) => item.email.toLowerCase() === email)) {
          return { ok: false as const, message: "이미 등록된 이메일이에요." };
        }
        const stamp = new Intl.DateTimeFormat("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
          .format(new Date())
          .replace(/\. /g, ".")
          .replace(/\.$/, "");
        const next: AdminAccount = {
          id: `admin-${Date.now()}`,
          loginId,
          email,
          role: input.role === "슈퍼 관리자" ? "슈퍼 관리자" : "관리자",
          status: "활동",
          lastSeen: stamp,
          joinedAt: stamp,
          suspendedAt: null,
        };
        setAdmins((current) => {
          const list = [...current, next];
          persistAdmins(list);
          return list;
        });
        return { ok: true as const };
      },
    }),
    [ready, session, members, products, categories, trades, settlements, inquiries, reports, admins],
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
