"use client";

import { Loader2, Mail, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatMeetingAt } from "@/lib/format";
import { canonicalStatus } from "@/lib/status";

/**
 * 운영자 화면.
 *
 * 노션이 어드민이라는 원칙은 그대로다. 여기서는 노션이 못 하는 것 하나만 한다 —
 * 지원자에게 안내 메일을 보내는 것. 상태·일시·문구는 전부 노션에서 채운다.
 *
 * 자동 발송을 붙이지 않은 이유: 메일은 되돌릴 수 없다. 노션에서 상태를 잘못
 * 눌렀다가 되돌리는 일은 흔하지만, 그 사이에 메일이 나가버리면 수습이 안 된다.
 */

interface Row {
  id: string;
  name: string;
  email: string;
  position: string;
  status: string;
  meetingAt: string;
  zoomUrl: string;
  notice: string;
  notifiedLog: string;
  createdAt: string;
}

const KEY = "admin-token";

export default function AdminPage() {
  // 입력값을 state로 들고 있지 않다. 저장된 키를 effect에서 밀어넣으면 렌더가
  // 한 번 더 도는 데다, 서버 렌더 결과와도 어긋난다.
  const inputRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved && inputRef.current) {
        inputRef.current.value = saved;
        tokenRef.current = saved;
      }
    } catch {
      // 시크릿 모드 등에서 접근이 막혀도 화면은 떠야 한다.
    }
  }, []);

  const load = useCallback(
    async () => {
      const t = inputRef.current?.value.trim() ?? "";
      if (!t) {
        setError("운영자 키를 입력해 주세요.");
        return;
      }
      tokenRef.current = t;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/applications", { headers: { "x-admin-token": t } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "불러오지 못했습니다.");
        setRows(data.items as Row[]);
        try {
          sessionStorage.setItem(KEY, t);
        } catch {
          /* 저장 실패는 무시한다 */
        }
      } catch (e) {
        setRows(null);
        setError(e instanceof Error ? e.message : "불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  async function notify(row: Row) {
    const status = canonicalStatus(row.status);
    const when = row.meetingAt ? formatMeetingAt(row.meetingAt) : "";
    const summary = [
      `${row.name} (${row.email})`,
      `상태: ${status || row.status}`,
      when ? `일시: ${when}` : "",
      row.zoomUrl ? `줌 링크: 있음` : "줌 링크: 없음",
      row.notice ? `안내 메시지: ${row.notice.slice(0, 40)}…` : "안내 메시지: 없음",
      row.notifiedLog ? `\n이미 보낸 기록: ${row.notifiedLog}` : "",
      `\n이 내용으로 안내 메일을 보낼까요?`,
    ]
      .filter(Boolean)
      .join("\n");

    if (!confirm(summary)) return;

    setSending(row.id);
    setFlash("");
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "content-type": "application/json", "x-admin-token": tokenRef.current },
        body: JSON.stringify({ id: row.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "발송에 실패했습니다.");
      setFlash(`${row.name}님에게 발송했습니다. (${data.via})`);
      setRows((prev) =>
        prev?.map((r) => (r.id === row.id ? { ...r, notifiedLog: data.log as string } : r)) ?? null,
      );
    } catch (e) {
      setFlash(e instanceof Error ? e.message : "발송에 실패했습니다.");
    } finally {
      setSending(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-16 sm:px-8 md:px-10 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl tracking-widest text-white uppercase">Admin</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          상태·미팅 일시·안내 문구는 노션에서 채우고, 여기서는 그 내용으로 안내 메일만 보냅니다.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            type="password"
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="운영자 키"
            className="flex-1 rounded-2xl border border-[var(--line)] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-white/40"
          />
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0c0c0c] disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            불러오기
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-[#e29aa2]">{error}</p>}
        {flash && <p className="mt-4 text-sm text-[var(--text-dim)]">{flash}</p>}

        {rows && (
          <p className="mt-8 text-xs tracking-widest text-[var(--muted)] uppercase">
            {rows.length}건
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {rows?.map((row) => {
            const when = row.meetingAt ? formatMeetingAt(row.meetingAt) : "";
            return (
              <li
                key={row.id}
                className="rounded-[24px] border border-[var(--line)] bg-white/[0.03] p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-white">{row.name}</strong>
                  <span className="text-xs text-[var(--muted)]">{row.position}</span>
                  <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-dim)]">
                    {row.status || "상태 없음"}
                  </span>
                </div>

                <p className="mt-2 text-xs break-all text-[var(--muted)]">{row.email}</p>

                {when && (
                  <p className="mt-3 text-sm text-[var(--text-dim)]">
                    일시 <span className="text-white">{when}</span>
                    {row.zoomUrl && <span className="ml-2 text-xs text-[var(--muted)]">줌 링크 있음</span>}
                  </p>
                )}

                {row.notice && (
                  <p className="mt-2 line-clamp-3 text-sm whitespace-pre-line text-[var(--text-dim)]/80">
                    {row.notice}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[var(--muted)]">
                    {row.notifiedLog ? `마지막 발송 · ${row.notifiedLog}` : "발송 이력 없음"}
                  </span>
                  <button
                    type="button"
                    onClick={() => notify(row)}
                    disabled={sending === row.id}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#0c0c0c] disabled:opacity-40"
                  >
                    {sending === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Mail className="h-3.5 w-3.5" />
                    )}
                    안내 메일 보내기
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
