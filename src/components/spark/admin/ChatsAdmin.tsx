"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { useSpark } from "@/components/spark/SparkProvider";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { useShared } from "@/data/shared";
import {
  ADMIN_WATCH_ROOMS,
  formatLocalStamp,
  getProductById,
  sellerAccount,
  type AdminMember,
  type ChatActivity,
  type ChatMessage,
  type ChatRoom,
  type Product,
} from "@/data/mockData";

const RISK_WORDS = ["씨발", "시발", "병신", "계좌", "카톡", "카카오톡", "카카오", "선입금"];

export function ChatsAdmin() {
  const { rooms } = useSpark();
  const { members, setSuspended } = useAdmin();
  const suspendedUntil = useShared().suspendedUntil;
  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState<"전체" | ChatActivity>("전체");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const catalog = useMemo(() => {
    const liveIds = new Set(rooms.map((room) => room.id));
    return [...rooms, ...ADMIN_WATCH_ROOMS.filter((room) => !liveIds.has(room.id))];
  }, [rooms]);
  const shown = catalog
    .filter((room) => {
      const product = getProductById(room.productId);
      const party = partiesOf(room, product);
      const needle = query.trim().toLowerCase();
      const haystack = `${party.buyerName} ${party.buyerEmail} ${party.sellerName} ${party.sellerEmail} ${room.sellerName} ${product?.title ?? ""}`.toLowerCase();
      const textOk = !needle || haystack.includes(needle);
      const state = room.activity ?? "활성";
      return textOk && (activity === "전체" || state === activity);
    })
    .slice()
    .sort((a, b) => (sort === "desc" ? roomStamp(b) - roomStamp(a) : roomStamp(a) - roomStamp(b)));
  const selected = catalog.find((room) => room.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">CHATS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">채팅 관리</h1>
        <p className="mt-2 text-sm text-slate-500">분쟁, 비속어, 외부 결제 유도가 보이는 대화를 참여자나 상품명으로 찾아 제재할 수 있어요.</p>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <FilterBar>
        <FilterField label="채팅 검색">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="참여자 닉네임·이메일 또는 상품명" className={fieldClass} />
        </FilterField>
        <FilterField label="상태" className="sm:max-w-[140px]">
          <select value={activity} onChange={(event) => setActivity(event.target.value as "전체" | ChatActivity)} className={fieldClass}>
            <option value="전체">전체</option>
            <option value="활성">활성</option>
            <option value="종료">종료</option>
          </select>
        </FilterField>
        <button type="button" className="self-end rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" onClick={() => setSort((current) => (current === "desc" ? "asc" : "desc"))}>
          {sort === "desc" ? "최신 대화순" : "과거 대화순"}
        </button>
      </FilterBar>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel title="채팅방" description={`${shown.length}개 표시`} flush>
          <DataTable wide={false} className="min-w-[560px]">
            <thead>
              <tr>
                <th className={thClass}>참여자</th>
                <th className={thClass}>상품</th>
                <th className={thClass}>최근 메시지</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>대화</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((room) => {
                const product = getProductById(room.productId);
                const party = partiesOf(room, product);
                const state = room.activity ?? "활성";
                const selectedRow = room.id === selectedId;
                return (
                  <tr key={room.id} className={`cursor-pointer hover:bg-slate-50 ${selectedRow ? "bg-slate-50" : ""}`} onClick={() => setSelectedId(room.id)}>
                    <td className={tdClass}>
                      <span className="block font-medium text-slate-900">
                        {party.buyerName} · {party.sellerName}
                      </span>
                      <span className="text-xs text-slate-400">
                        {party.buyerEmail || "이메일 없음"} · {party.sellerEmail || "이메일 없음"}
                      </span>
                    </td>
                    <td className={tdClass}>{product?.title ?? room.productId}</td>
                    <td className={`${tdClass} max-w-[220px]`}>
                      <span className="line-clamp-2">{previewOf(room)}</span>
                    </td>
                    <td className={tdClass}>
                      <StatusPill tone={state === "활성" ? "emerald" : "slate"}>{state}</StatusPill>
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(room.id);
                        }}
                      >
                        열기
                      </button>
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 ? (
                <tr>
                  <td className={`${tdClass} text-slate-400`} colSpan={5}>
                    조건에 맞는 채팅방이 없어요.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </DataTable>
        </Panel>
        <Panel title={selected ? "대화 타임라인" : "대화"} description={selected ? "텍스트, 사진, 동영상을 시간순으로 확인합니다." : "채팅방을 선택하면 대화가 열려요."}>
          {selected ? (
            <Thread
              room={selected}
              members={members}
              suspendedUntil={suspendedUntil}
              onToggle={(member, suspended) => {
                setSuspended(member.id, !suspended);
                setNotice(suspended ? `${member.name} 님의 정지를 해제했어요.` : `${member.name} 님의 활동을 정지했어요.`);
              }}
            />
          ) : (
            <p className="text-sm text-slate-400">목록에서 채팅방을 눌러 주세요.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Thread({
  room,
  members,
  suspendedUntil,
  onToggle,
}: {
  room: ChatRoom;
  members: AdminMember[];
  suspendedUntil: Record<string, string>;
  onToggle: (member: AdminMember, suspended: boolean) => void;
}) {
  const product = getProductById(room.productId);
  const party = partiesOf(room, product);
  const people = [
    { ...findMember(members, party.buyerEmail, party.buyerName), label: "구매자", name: party.buyerName, email: party.buyerEmail },
    { ...findMember(members, party.sellerEmail, party.sellerName), label: "판매자", name: party.sellerName, email: party.sellerEmail },
  ];
  return (
    <div>
      <p className="text-sm font-medium text-slate-900">{product?.title ?? room.productId}</p>
      <ul className="mt-3 space-y-2">
        {people.map((person) => {
          const suspended = person.member ? isSuspended(person.member, suspendedUntil) : false;
          return (
            <li key={person.label} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm text-slate-900">
                  <span>
                    {person.label} {person.name}
                  </span>
                  {suspended ? <StatusPill tone="rose">정지</StatusPill> : null}
                </p>
                <p className="text-xs text-slate-400">{person.email || "연결된 회원 이메일 없음"}</p>
              </div>
              {person.member ? (
                <button
                  type="button"
                  onClick={() => onToggle(person.member as AdminMember, suspended)}
                  className={suspended ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white" : "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"}
                >
                  {suspended ? "정지 해제" : "활동 정지"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ol className="mt-4 space-y-4">
        {room.messages.map((message) => {
          const who = speakerOf(room, product, message.sender);
          const text = message.translatedText ?? message.text ?? "";
          return (
            <li key={message.id} className="border-l-2 border-slate-200 pl-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-slate-900">{who.name}</span>
                <span className="text-xs text-slate-400">
                  {who.role}
                  {who.email ? ` · ${who.email}` : ""}
                </span>
                <span className="text-xs tabular-nums text-slate-400">{message.sentAt ? formatLocalStamp(message.sentAt) : message.at}</span>
                {hasRisk(text) ? <StatusPill tone="rose">주의 표현</StatusPill> : null}
              </div>
              {message.imageUrl ? <img src={message.imageUrl} alt="첨부 사진" className="mt-2 h-28 w-28 rounded-xl object-cover" /> : null}
              {message.videoUrl ? <video src={message.videoUrl} controls className="mt-2 max-h-48 w-full rounded-xl bg-slate-900" /> : null}
              {text ? <p className="mt-1 text-sm leading-6 text-slate-700"><RiskText text={text} /></p> : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function partiesOf(room: ChatRoom, product: Product | null) {
  const account = sellerAccount(product?.sellerId ?? "");
  const shopOwnsListing = product?.sellerId === "me";
  return {
    buyerName: room.buyerName ?? (shopOwnsListing ? room.sellerName : "구매자"),
    buyerEmail: room.buyerEmail ?? "",
    sellerName: shopOwnsListing ? account.name : room.sellerName || account.name,
    sellerEmail: room.sellerEmail ?? account.email,
  };
}

function speakerOf(room: ChatRoom, product: Product | null, sender: ChatMessage["sender"]) {
  const party = partiesOf(room, product);
  const shopOwnsListing = product?.sellerId === "me";
  if (shopOwnsListing) {
    return sender === "me"
      ? { name: party.sellerName, email: party.sellerEmail, role: "판매자" as const }
      : { name: party.buyerName, email: party.buyerEmail, role: "구매자" as const };
  }
  return sender === "seller"
    ? { name: party.sellerName, email: party.sellerEmail, role: "판매자" as const }
    : { name: party.buyerName, email: party.buyerEmail, role: "구매자" as const };
}

function findMember(members: AdminMember[], email: string, name: string) {
  const member = members.find((item) => (email && item.email.toLowerCase() === email.toLowerCase()) || item.name === name) ?? null;
  return { member };
}

function isSuspended(member: AdminMember, until: Record<string, string>) {
  const keys = [member.id, member.id.replace(/^mem-/, "")];
  const active = keys.some((key) => until[key] && Date.parse(until[key]) > Date.now());
  return member.suspended || active;
}

function roomStamp(room: ChatRoom) {
  if (!room.updatedAt) return 0;
  const parsed = Date.parse(room.updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function previewOf(room: ChatRoom) {
  const message = room.messages[room.messages.length - 1];
  if (!message) return "메시지 없음";
  if (message.videoUrl && !message.text) return "동영상";
  if (message.imageUrl && !message.text) return "사진";
  return message.translatedText ?? message.text ?? "미디어";
}

function hasRisk(text: string) {
  return RISK_WORDS.some((word) => text.includes(word));
}

function RiskText({ text }: { text: string }) {
  const parts = text.split(/(씨발|시발|병신|계좌|카톡|카카오톡|카카오|선입금)/g);
  return (
    <>
      {parts.map((part, index) =>
        RISK_WORDS.includes(part) ? (
          <mark key={`${part}-${index}`} className="rounded bg-rose-100 px-0.5 text-rose-800">
            {part}
          </mark>
        ) : (
          <span key={`${index}-${part.slice(0, 12)}`}>{part}</span>
        ),
      )}
    </>
  );
}
