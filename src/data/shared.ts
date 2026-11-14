"use client";

import { useSyncExternalStore } from "react";
import {
  ADMIN_REPORTS,
  BOARD_POSTS,
  FAQS,
  NOTICES,
  REVIEWS,
  TERMS_VERSIONS,
  formatRetentionDate,
  getProductById,
  hardDeleteAtFrom,
  type BoardPost,
  type Faq,
  type Notice,
  type ReportCategory,
  type ReportMedia,
  type Review,
  type TermVersion,
} from "@/data/mockData";
import { SEED_BOARDS, type BoardDraft, type BoardRecord } from "@/features/admin-boards/model";

export type LiveReport = {
  id: string;
  category: ReportCategory;
  targetType: ReportCategory | "채팅" | "회원";
  targetId: string;
  targetLabel: string;
  body: string;
  photoCount: number;
  media: ReportMedia[];
  reporter: string;
  createdAt: string;
  status: "접수" | "검토" | "수락" | "거절";
};

export type RetentionRecord = {
  kind: "상품" | "리뷰";
  id: string;
  deletedAt: string;
  hardDeleteAt: string;
};

type SharedState = {
  reports: LiveReport[];
  reviews: Review[];
  faqs: Faq[];
  notices: Notice[];
  boards: BoardRecord[];
  posts: BoardPost[];
  terms: TermVersion[];
  suspendedUntil: Record<string, string>;
  deletedProductIds: string[];
  purgedProductIds: string[];
  deletions: RetentionRecord[];
};

const SANCTION_AT = 4;

function reachedSanction(count: number) {
  return count >= SANCTION_AT;
}
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function reportCategory(targetType: LiveReport["targetType"]): ReportCategory {
  if (targetType === "상품") return "상품";
  if (targetType === "리뷰") return "리뷰";
  return "유저";
}

export function isReportClosed(status: LiveReport["status"]) {
  return status === "수락" || status === "거절";
}

export function reportTimestamp(value: string) {
  const parsed = Date.parse(value.includes("T") ? value : value.replace(/\./g, "-").replace(" ", "T"));
  return Number.isNaN(parsed) ? 0 : parsed;
}

const INITIAL_REPORTS: LiveReport[] = ADMIN_REPORTS.map((report) => ({
  id: report.id,
  category: report.category,
  targetType: report.targetType,
  targetId: report.targetId,
  targetLabel: report.targetLabel,
  body: report.reason,
  photoCount: report.media.length,
  media: report.media,
  reporter: report.reporter,
  createdAt: report.createdAt,
  status: report.status,
}));

const PRODUCT_SANCTION_AT = "2026-10-27T09:00:00+09:00";

function overdueProductIds(reports: LiveReport[]) {
  const counts = new Map<string, number>();
  for (const report of reports) {
    if (report.status !== "수락" || reportCategory(report.targetType) !== "상품") continue;
    counts.set(report.targetId, (counts.get(report.targetId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([id, count]) => reachedSanction(count) && getProductById(id)?.saleStatus !== "예약중")
    .map(([id]) => id);
}

const INITIAL_PRODUCT_DELETIONS = overdueProductIds(INITIAL_REPORTS);

let state: SharedState = {
  reports: INITIAL_REPORTS,
  reviews: REVIEWS,
  faqs: FAQS,
  notices: NOTICES,
  boards: SEED_BOARDS,
  posts: BOARD_POSTS,
  terms: TERMS_VERSIONS,
  suspendedUntil: {},
  deletedProductIds: INITIAL_PRODUCT_DELETIONS,
  purgedProductIds: [],
  deletions: INITIAL_PRODUCT_DELETIONS.map((id) => ({
    kind: "상품" as const,
    id,
    deletedAt: PRODUCT_SANCTION_AT,
    hardDeleteAt: hardDeleteAtFrom(PRODUCT_SANCTION_AT),
  })),
};

const listeners = new Set<() => void>();

function emit(next: SharedState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getShared() {
  return state;
}

export function useShared() {
  return useSyncExternalStore(subscribe, getShared, getShared);
}

export function submitReport(report: Omit<LiveReport, "id" | "status" | "createdAt" | "category" | "media"> & { media?: ReportMedia[] }) {
  const media = (report.media ?? []).slice(0, 5);
  const next: LiveReport = {
    ...report,
    category: reportCategory(report.targetType),
    media,
    photoCount: Math.min(5, Math.max(report.photoCount, media.length)),
    id: `rpt-${crypto.randomUUID()}`,
    status: "접수",
    createdAt: new Date().toISOString(),
  };
  const base = purgeExpired(state);
  emit({ ...base, reports: [next, ...base.reports] });
  return next.id;
}

export function rejectReport(id: string) {
  const base = purgeExpired(state);
  emit({
    ...base,
    reports: base.reports.map((report) => (report.id === id ? { ...report, status: "거절" } : report)),
  });
}

export function reviewReport(id: string) {
  const base = purgeExpired(state);
  emit({
    ...base,
    reports: base.reports.map((report) => (report.id === id && report.status === "접수" ? { ...report, status: "검토" } : report)),
  });
}

export function releaseUserSuspension(targetId: string) {
  const keys = new Set([targetId, targetId.replace(/^mem-/, ""), `mem-${targetId.replace(/^mem-/, "")}`]);
  const suspendedUntil = { ...state.suspendedUntil };
  for (const key of Object.keys(suspendedUntil)) {
    if (keys.has(key)) delete suspendedUntil[key];
  }
  emit({ ...state, suspendedUntil });
}

export function acceptReport(id: string, options?: { reserved?: boolean }) {
  const base = purgeExpired(state);
  const current = base.reports.find((report) => report.id === id);
  if (!current || current.status === "수락" || current.status === "거절") return "이미 처리된 신고예요.";
  const reports = base.reports.map((report) => (report.id === id ? { ...report, status: "수락" as const } : report));
  const category = reportCategory(current.targetType);
  const count = reports.filter(
    (report) => report.status === "수락" && reportCategory(report.targetType) === category && report.targetId === current.targetId,
  ).length;
  if (!reachedSanction(count)) {
    emit({ ...base, reports });
    return `신고를 수락했어요. 같은 대상의 누적 수락은 ${count}회예요.`;
  }
  const deletedAt = new Date().toISOString();
  const hardDeleteAt = hardDeleteAtFrom(deletedAt);
  if (category === "상품") {
    if (options?.reserved) {
      emit({ ...base, reports });
      return "신고 수락이 3회를 초과했지만 예약중 상품은 삭제할 수 없어요.";
    }
    emit({
      ...base,
      reports,
      deletedProductIds: base.deletedProductIds.includes(current.targetId) ? base.deletedProductIds : [...base.deletedProductIds, current.targetId],
      deletions: rememberDeletion(base.deletions, { kind: "상품", id: current.targetId, deletedAt, hardDeleteAt }),
    });
    return `신고 수락이 3회를 초과해 상품을 삭제했어요. 소프트 딜리트되며 ${formatRetentionDate(hardDeleteAt)} 이후 하드 딜리트할 수 있어요.`;
  }
  if (category === "리뷰") {
    emit({
      ...base,
      reports,
      reviews: base.reviews.map((review) => (review.id === current.targetId ? { ...review, deletedAt, hardDeleteAt } : review)),
      deletions: rememberDeletion(base.deletions, { kind: "리뷰", id: current.targetId, deletedAt, hardDeleteAt }),
    });
    return `신고 수락이 3회를 초과해 리뷰를 삭제했어요. 소프트 딜리트되며 ${formatRetentionDate(hardDeleteAt)} 이후 하드 딜리트할 수 있어요.`;
  }
  const until = new Date(Date.now() + THREE_DAYS_MS).toISOString();
  emit({ ...base, reports, suspendedUntil: { ...base.suspendedUntil, [current.targetId]: until } });
  return "신고 수락이 3회를 초과해 3일 활동 정지했습니다.";
}

function rememberDeletion(current: RetentionRecord[], next: RetentionRecord) {
  if (current.some((item) => item.kind === next.kind && item.id === next.id)) return current;
  return [...current, next];
}

function purgeExpired(source: SharedState, now = Date.now()): SharedState {
  const reviews = source.reviews.filter((review) => !review.hardDeleteAt || Date.parse(review.hardDeleteAt) > now);
  const expiredProductIds = source.deletions.filter((item) => item.kind === "상품" && Date.parse(item.hardDeleteAt) <= now).map((item) => item.id);
  const deletions = source.deletions.filter((item) => Date.parse(item.hardDeleteAt) > now);
  if (reviews.length === source.reviews.length && deletions.length === source.deletions.length) return source;
  const expired = new Set(expiredProductIds);
  return {
    ...source,
    reviews,
    deletions,
    deletedProductIds: source.deletedProductIds.filter((id) => !expired.has(id)),
    purgedProductIds: [...source.purgedProductIds, ...expiredProductIds],
  };
}

export function applyRetentionPolicy() {
  const next = purgeExpired(state);
  if (next !== state) emit(next);
}

export function addReview(review: Review) {
  emit({ ...state, reviews: [review, ...state.reviews] });
}

export function addFaq(faq: Faq) {
  emit({ ...state, faqs: [faq, ...state.faqs] });
}

export function softDeleteFaq(id: string) {
  emit({
    ...state,
    faqs: state.faqs.map((faq) => (faq.id === id ? { ...faq, deletedAt: new Date().toISOString() } : faq)),
  });
}

export function addBoard(draft: BoardDraft) {
  const name = draft.name.trim();
  const category = draft.category.trim();
  if (!name || !category) return "invalid" as const;
  if (state.boards.some((board) => board.name === name)) return "duplicate" as const;
  emit({ ...state, boards: [{ id: crypto.randomUUID(), ...draft, name, category }, ...state.boards] });
  return "ok" as const;
}

export function updateBoard(id: string, draft: BoardDraft) {
  const name = draft.name.trim();
  const category = draft.category.trim();
  if (!name || !category) return;
  emit({
    ...state,
    boards: state.boards.map((board) => (board.id === id ? { ...board, ...draft, name, category } : board)),
  });
}

export function removeBoard(id: string) {
  emit({ ...state, boards: state.boards.filter((board) => board.id !== id) });
}

export function addNotice(notice: Notice) {
  emit({ ...state, notices: [notice, ...state.notices] });
}

export function softDeleteNotice(id: string) {
  emit({
    ...state,
    notices: state.notices.map((notice) => (notice.id === id ? { ...notice, deletedAt: new Date().toISOString() } : notice)),
  });
}

export function addTerm(term: TermVersion) {
  emit({ ...state, terms: [term, ...state.terms] });
}
