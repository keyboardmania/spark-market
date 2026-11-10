"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, DetailModal, DetailRows, FilterBar, FilterField, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import { releaseUserSuspension, useShared, type LiveReport } from "@/data/shared";
import { formatLocalStamp, type AdminMember, type MembershipStatus } from "@/data/mockData";

export function MembersAdmin() {
  const { members, setSuspended } = useAdmin();
  const shared = useShared();
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [membership, setMembership] = useState<"전체" | MembershipStatus>("전체");
  const [activityFilter, setActivityFilter] = useState<"전체" | "정상" | "정지">("전체");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shown = members
    .filter((member) => {
      const needle = query.trim().toLowerCase();
      const textOk = !needle || `${member.name} ${member.email}`.toLowerCase().includes(needle);
      const membershipOk = membership === "전체" || member.membership === membership;
      const activity = activityOf(member, shared.suspendedUntil);
      const activityOk = activityFilter === "전체" || (activityFilter === "정지" ? activity.suspended : !activity.suspended);
      return textOk && membershipOk && activityOk;
    })
    .slice()
    .sort((a, b) => {
      const stamp = `${a.joinedAt} ${a.joinedTime}`.localeCompare(`${b.joinedAt} ${b.joinedTime}`);
      return sort === "asc" ? stamp : -stamp;
    });
  const selected = members.find((member) => member.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">MEMBERS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">회원 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <FilterBar>
        <FilterField label="회원 검색">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="닉네임 또는 이메일" className={fieldClass} />
        </FilterField>
        <FilterField label="멤버십" className="sm:max-w-[160px]">
          <select value={membership} onChange={(event) => setMembership(event.target.value as "전체" | MembershipStatus)} className={fieldClass}>
            <option value="전체">전체</option>
            <option value="구독 중">구독 중</option>
            <option value="미구독">미구독</option>
          </select>
        </FilterField>
        <FilterField label="활동상태" className="sm:max-w-[140px]">
          <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value as "전체" | "정상" | "정지")} className={fieldClass}>
            <option value="전체">전체</option>
            <option value="정상">정상</option>
            <option value="정지">정지</option>
          </select>
        </FilterField>
        <button type="button" className="self-end rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700" onClick={() => setSort((current) => (current === "asc" ? "desc" : "asc"))}>
          {sort === "asc" ? "가입일시 순" : "가입 최신순"}
        </button>
      </FilterBar>
      <Panel title="회원 목록" description="가입일시 순이 기본입니다. 행이나 상세 버튼으로 회원 정보를 열 수 있어요." flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>이메일</th>
              <th className={thClass}>닉네임</th>
              <th className={thClass}>멤버십</th>
              <th className={thClass}>활동상태</th>
              <th className={thClass}>접속일</th>
              <th className={thClass}>권한</th>
              <th className={thClass}>상세</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((member) => {
              const activity = activityOf(member, shared.suspendedUntil);
              return (
                <tr key={member.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedId(member.id)}>
                  <td className={tdClass}>{member.email}</td>
                  <td className={`${tdClass} font-medium text-slate-900`}>{member.name}</td>
                  <td className={tdClass}>
                    <StatusPill tone={member.membership === "구독 중" ? "emerald" : "slate"}>{member.membership}</StatusPill>
                  </td>
                  <td className={tdClass}>
                    <StatusPill tone={activity.suspended ? "rose" : "sky"}>{activity.suspended ? "정지" : "정상"}</StatusPill>
                  </td>
                  <td className={`${tdClass} tabular-nums`}>{member.lastSeen}</td>
                  <td className={tdClass}>{member.role}</td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedId(member.id);
                      }}
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={7}>
                  표시할 회원이 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
      </Panel>
      {selected ? (
        <MemberDetail
          member={selected}
          reports={shared.reports}
          suspendedUntil={shared.suspendedUntil}
          onClose={() => setSelectedId(null)}
          onToggle={() => {
            const activity = activityOf(selected, shared.suspendedUntil);
            if (activity.suspended) {
              setSuspended(selected.id, false);
              releaseUserSuspension(selected.id);
              setNotice(`${selected.name} 님의 정지를 해제했어요.`);
            } else {
              setSuspended(selected.id, true);
              setNotice(`${selected.name} 님의 활동을 정지했어요.`);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function MemberDetail({
  member,
  reports,
  suspendedUntil,
  onClose,
  onToggle,
}: {
  member: AdminMember;
  reports: LiveReport[];
  suspendedUntil: Record<string, string>;
  onClose: () => void;
  onToggle: () => void;
}) {
  const close = useMemo(() => onClose, [onClose]);
  const activity = activityOf(member, suspendedUntil);
  const strikes = reportCount(member, reports);
  return (
    <DetailModal title="회원 상세" onClose={close}>
      <DetailRows
        rows={[
          { label: "이메일", value: member.email },
          { label: "닉네임", value: member.name },
          { label: "멤버십 구독", value: member.membership },
          { label: "IP", value: member.ip },
          { label: "OS", value: member.os },
          { label: "활동상태", value: activity.suspended ? "정지" : "정상" },
          { label: "접속일", value: member.lastSeen },
          { label: "가입일시", value: `${member.joinedAt} ${member.joinedTime}` },
          { label: "권한", value: member.role },
          { label: "신고 누적 횟수", value: `${strikes}회${activity.until ? ` · 정지 해제 ${formatLocalStamp(activity.until)}` : ""}` },
        ]}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onToggle}
          className={activity.suspended ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white" : "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"}
        >
          {activity.suspended ? "정지 해제" : "활동 정지"}
        </button>
      </div>
    </DetailModal>
  );
}

function activityOf(member: AdminMember, until: Record<string, string>) {
  const keys = [member.id, member.id.replace(/^mem-/, "")];
  const active = keys.map((key) => until[key]).find((value) => value && Date.parse(value) > Date.now()) ?? null;
  return { suspended: member.suspended || Boolean(active), until: active };
}

function reportCount(member: AdminMember, reports: LiveReport[]) {
  const keys = new Set([member.id, member.id.replace(/^mem-/, ""), member.name]);
  const live = reports.filter((report) => report.status === "수락" && report.category === "유저" && (keys.has(report.targetId) || keys.has(report.targetLabel))).length;
  return Math.max(member.reports, live);
}

