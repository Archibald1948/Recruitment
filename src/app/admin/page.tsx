"use client";

import { Loader2, Mail, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

/** 목록만 가져온다. 상태 변경은 호출한 쪽에서 한다 — effect 안에서 곧바로
 *  setState를 부르면 렌더가 연쇄로 돈다. */
async function fetchRows(): Promise<Row[]> {
  const res = await fetch("/api/admin/applications");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "불러오지 못했습니다.");
  return data.items as Row[];
}

const message = (e: unknown) => (e instanceof Error ? e.message : "불러오지 못했습니다.");

export default function AdminPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  // 들어오자마자 한 번 불러오므로 처음부터 로딩 상태다.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [flash, setFlash] = useState("");

  // 인증은 게이트가 심어둔 세션 쿠키가 한다. 화면이 키를 들고 있지 않으므로
  // 여기서 새어 나갈 것도 없다.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchRows());
    } catch (e) {
      setRows(null);
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // 들어오면 바로 목록을 띄운다. 키를 다시 칠 이유가 없어졌다.
  useEffect(() => {
    let alive = true;
    fetchRows()
      .then((items) => alive && setRows(items))
      .catch((e) => alive && setError(message(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

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
        headers: { "content-type": "application/json" },
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

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0c0c0c] disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            새로고침
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin-gate", { method: "DELETE" });
              window.location.reload();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-5 py-3 text-sm text-[var(--muted)] transition-colors hover:text-white"
          >
            잠그기
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
