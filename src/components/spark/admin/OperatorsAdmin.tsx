"use client";

import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass } from "@/components/spark/styles";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function OperatorsAdmin() {
  const { admins } = useAdmin();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = admins.filter((admin) => !needle || `${admin.name} ${admin.email} ${admin.role}`.toLowerCase().includes(needle));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">OPERATORS</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">운영자 계정 관리</h1>
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름, 이메일, 권한" className={`${fieldClass} max-w-xs`} />
      <Panel title="운영자 계정" description="운영자 정보를 검색하고 조회합니다." flush>
        <DataTable wide={false}>
          <thead>
            <tr>
              <th className={thClass}>이름</th>
              <th className={thClass}>이메일</th>
              <th className={thClass}>권한</th>
              <th className={thClass}>최근 접속</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((admin) => (
              <tr key={admin.id}>
                <td className={`${tdClass} font-medium text-slate-900`}>{admin.name}</td>
                <td className={tdClass}>{admin.email}</td>
                <td className={tdClass}>
                  <StatusPill>{admin.role}</StatusPill>
                </td>
                <td className={`${tdClass} tabular-nums`}>{admin.lastSeen}</td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={4}>
                  표시할 운영자가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}
