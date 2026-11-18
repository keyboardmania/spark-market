"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/spark/AdminProvider";
import { OPERATOR_CREATE_NOTICE_KEY } from "@/components/spark/admin/OperatorCreate";
import { SuperAdminVerifyModal } from "@/components/spark/admin/SuperAdminVerifyModal";
import { fieldClass, primaryButtonClass } from "@/components/spark/styles";
import { AdminPager, useAdminPage } from "@/components/spark/admin/paging";
import { DataTable, Panel, StatusPill, tdClass, thClass } from "@/components/spark/admin/ui";

export function OperatorsAdmin() {
  const router = useRouter();
  const { admins, session, deleteAdmin } = useAdmin();
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const message = window.sessionStorage.getItem(OPERATOR_CREATE_NOTICE_KEY);
      if (!message) return;
      window.sessionStorage.removeItem(OPERATOR_CREATE_NOTICE_KEY);
      setNotice(message);
    } catch {
      /* ignore */
    }
  }, []);
  const needle = query.trim().toLowerCase();
  const shown = admins.filter((admin) => !needle || `${admin.loginId} ${admin.email} ${admin.role} ${admin.status}`.toLowerCase().includes(needle));
  const operatorPage = useAdminPage(shown.length, query);
  const operatorRows = shown.slice(operatorPage.start, operatorPage.start + operatorPage.pageSize);
  const canManage = session?.role === "슈퍼 관리자";
  const superEmail = session?.email ?? admins.find((item) => item.role === "슈퍼 관리자")?.email ?? "";
  const deleting = admins.find((item) => item.id === deleteId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-slate-400">OPERATORS</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">운영자 계정 관리</h1>
          <p className="mt-2 text-sm text-slate-500">권한은 슈퍼 관리자 / 관리자 두 가지입니다.</p>
          {notice ? <p className="mt-2 text-sm text-slate-500">{notice}</p> : null}
        </div>
        {canManage ? (
          <button type="button" className={primaryButtonClass} onClick={() => setRegisterOpen(true)}>
            등록
          </button>
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
              <th className={thClass}>조치</th>
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
                <td className={tdClass}>
                  {canManage ? (
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => setDeleteId(admin.id)}
                    >
                      삭제
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td className={`${tdClass} text-slate-400`} colSpan={6}>
                  표시할 운영자가 없어요.
                </td>
              </tr>
            ) : null}
          </tbody>
        </DataTable>
        <AdminPager page={operatorPage.page} pageCount={operatorPage.pageCount} total={operatorPage.total} pageSize={operatorPage.pageSize} onPage={operatorPage.setPage} />
      </Panel>

      {registerOpen ? (
        <SuperAdminVerifyModal
          title="슈퍼 관리자 이메일 인증"
          description="운영자 등록 페이지로 이동하기 전에 슈퍼 관리자 이메일 인증이 필요해요."
          expectedEmail={superEmail}
          confirmLabel="확인"
          onClose={() => setRegisterOpen(false)}
          onConfirm={() => {
            setRegisterOpen(false);
            router.push("/admin/operators/new");
          }}
        />
      ) : null}

      {deleting ? (
        <SuperAdminVerifyModal
          title="슈퍼 관리자 이메일 인증"
          description={`${deleting.loginId} 운영자를 삭제하려면 슈퍼 관리자 이메일 인증이 필요해요.`}
          expectedEmail={superEmail}
          confirmLabel="확인"
          onClose={() => setDeleteId(null)}
          onConfirm={() => {
            const result = deleteAdmin(deleting.id);
            setDeleteId(null);
            setNotice(result.ok ? `${deleting.loginId} 운영자를 삭제했어요.` : result.message);
          }}
        />
      ) : null}
    </div>
  );
}
