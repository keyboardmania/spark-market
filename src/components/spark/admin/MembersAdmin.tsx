"use client";

import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";
import type { MembershipTier } from "@/data/mockData";

export function MembersAdmin() {
  const { members, setSuspended, admins } = useAdmin();
  const [notice, setNotice] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">MEMBERS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">회원 관리</h1>
        {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
      </div>
      <Panel title="회원 목록" description="이메일, 성인 인증, 가입일과 함께 가입국가, 멤버십 등급, 접속 IP, 운영체제 정보를 확인할 수 있어요." flush>
        <DataTable className="min-w-[1280px]">
          <thead>
            <tr>
              <th className={thClass}>회원</th>
              <th className={thClass}>이메일</th>
              <th className={thClass}>성인인증</th>
              <th className={thClass}>가입일</th>
              <th className={thClass}>가입국가</th>
              <th className={thClass}>멤버십 등급</th>
              <th className={thClass}>회원 IP</th>
              <th className={thClass}>회원 운영체제(OS) 정보</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>조치</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td className={tdClass}>
                  <span className="font-medium text-slate-900">{member.name}</span>
                  {member.reports > 0 ? <span className="mt-1 block text-xs text-slate-400">신고 {member.reports}건</span> : null}
                </td>
                <td className={tdClass}>{member.email}</td>
                <td className={tdClass}>
                  <StatusPill tone={member.adultVerified ? "emerald" : "slate"}>{member.adultVerified ? "완료" : "미인증"}</StatusPill>
                </td>
                <td className={`${tdClass} tabular-nums`}>{member.joinedAt}</td>
                <td className={tdClass}>{member.country}</td>
                <td className={tdClass}>
                  <StatusPill tone={membershipTone(member.membership)}>{member.membership}</StatusPill>
                </td>
                <td className={`${tdClass} font-mono text-xs tabular-nums`}>{member.ip}</td>
                <td className={tdClass}>{member.os}</td>
                <td className={tdClass}>
                  <StatusPill tone={member.suspended ? "rose" : "sky"}>{member.suspended ? "정지" : "정상"}</StatusPill>
                </td>
                <td className={tdClass}>
                  <button
                    type="button"
                    onClick={() => {
                      setSuspended(member.id, !member.suspended);
                      setNotice(member.suspended ? `${member.name} 님의 정지를 해제했어요.` : `${member.name} 님의 활동을 정지했어요.`);
                    }}
                    className={member.suspended ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white" : "rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700"}
                  >
                    {member.suspended ? "정지 해제" : "활동 정지"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
      <Panel title="관리자 계정" flush>
        <DataTable>
          <thead>
            <tr>
              <th className={thClass}>이름</th>
              <th className={thClass}>이메일</th>
              <th className={thClass}>권한</th>
              <th className={thClass}>최근 접속</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td className={`${tdClass} font-medium text-slate-900`}>{admin.name}</td>
                <td className={tdClass}>{admin.email}</td>
                <td className={tdClass}>
                  <StatusPill>{admin.role}</StatusPill>
                </td>
                <td className={`${tdClass} tabular-nums`}>{admin.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}

function membershipTone(tier: MembershipTier) {
  if (tier === "플래티넘") return "sky" as const;
  if (tier === "골드") return "amber" as const;
  if (tier === "실버") return "slate" as const;
  return "emerald" as const;
}
