"use client";

import { useSyncExternalStore } from "react";
import { USER_INQUIRIES, type InquiryType, type UserInquiryStatus } from "@/data/mockData";

export type InquiryPhoto = { name: string; url: string };

export type InquiryRecord = {
  id: string;
  type: InquiryType;
  body: string;
  photo: InquiryPhoto | null;
  status: "접수 완료" | "답변 완료";
  createdAt: string;
  reply: string;
};

function normalizeStatus(status: UserInquiryStatus): InquiryRecord["status"] {
  return status === "답변완료" ? "답변 완료" : "접수 완료";
}

let records: InquiryRecord[] = USER_INQUIRIES.map((item) => ({
  id: item.id,
  type: item.type,
  body: item.body,
  photo: item.photoName ? { name: item.photoName, url: "" } : null,
  status: normalizeStatus(item.status),
  createdAt: item.createdAt,
  reply: item.reply,
}));

const listeners = new Set<() => void>();

function emit(next: InquiryRecord[]) {
  records = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInquiries() {
  return useSyncExternalStore(subscribe, () => records, () => records);
}

export function inquiryById(id: string) {
  return records.find((item) => item.id === id) ?? null;
}

export function submitInquiry(input: { type: InquiryType; body: string; photo: InquiryPhoto | null }) {
  const now = new Date();
  const createdAt = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  emit([
    {
      id: `inq-${crypto.randomUUID()}`,
      type: input.type,
      body: input.body,
      photo: input.photo,
      status: "접수 완료",
      createdAt,
      reply: "",
    },
    ...records,
  ]);
}
