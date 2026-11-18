"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function OperatorsAdmin() {
  const { admins, session } = useAdmin();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const shown = admins.filter((admin) => !needle || `${admin.loginId} ${admin.email} ${admin.role} ${admin.status}`.toLowerCase().includes(needle));
  const operatorPage = useAdminPage(shown.length, query);
  const operatorRows = shown.slice(operatorPage.start, operatorPage.start + operatorPage.pageSize);
  const canRegister = session?.role === "슈퍼 관리자";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">OPERATORS</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">운영자 계정 관리</h1>
          <p className="mt-2 text-sm text-slate-500">권한은 슈퍼 관리자 / 관리자 두 가지입니다.</p>
        </div>
        {canRegister ? (
          <Link href="/admin/operators/new" className={primaryButtonClass}>
            등록
          </Link>
        ) : (
          <p className="text-xs text-slate-400">운영자 등록은 슈퍼 관리자만 가능합니다.</p>
        )}
      </div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="아이디, 이메일, 권한" className={`${fieldClass} max-w-xs`} />
      <Panel title="운영자 계정" description="관리자 아이디 기준으로 조회합니다." flush>
        <DataTable wide={false}>
          <thead>
            <tr>
              <th className={thClass}>관리자 아이디</th>
              <th className={thClass}>접속일</th>
              <th className={thClass}>가입일시</th>
              <th className={thClass}>상태</th>
              <th className={thClass}>활동정지일시</th>
            </tr>
          </thead>
          <tbody>
            {operatorRows.map((admin) => (
              <tr key={admin.id}>
                <td className={`${tdClass} font-medium text-slate-900`}>
                  {admin.loginId}
                  <span className="mt-1 block text-xs font-normal text-slate-400">{admin.role} · {admin.email}</span>
                </td>
                <td className={`${tdClass} tabular-nums`}>{admin.lastSeen}</td>
                <td className={`${tdClass} tabular-nums`}>{admin.joinedAt}</td>
                <td className={tdClass}>
                  <StatusPill tone={admin.status === "정지" ? "rose" : "emerald"}>{admin.status}</StatusPill>
                </td>
                <td className={`${tdClass} tabular-nums`}>{admin.suspendedAt ?? "—"}</td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={5}>
                  표시할 운영자가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={operatorPage.page} pageCount={operatorPage.pageCount} total={operatorPage.total} pageSize={operatorPage.pageSize} onPage={operatorPage.setPage} />
      </Panel>
    </div>
  );
}
