"use client";

import { Check, ChevronDown, Loader2, Mail, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatMeetingAt, fromDateTimeLocalKst, toDateTimeLocalKst } from "@/lib/format";
import { formatSlot } from "@/lib/meeting-slots";
import { canonicalStatus, STATUS_FLOW } from "@/lib/status";

/**
 * 운영자 화면.
 *
 * 심사 항목을 고치고 안내 메일을 보내는 곳. 노션은 저장소로 두고, 판단과 입력은
 * 한 화면에서 끝낸다. 노션을 열어 고쳐도 결과는 같다 — 같은 값을 보고 쓴다.
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
  preferredSlot: string;
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

/**
 * 지원자 한 명. 심사 항목을 이 자리에서 고치고 저장한다.
 *
 * 노션을 오가지 않아도 되도록 상태·일시·링크·문구를 전부 여기 둔다.
 * 노션은 저장소로만 남는다.
 *
 * 초안을 행마다 따로 들고 있으므로 컴포넌트를 나눴다. 부모가 한꺼번에 들면
 * 한 칸만 고쳐도 목록 전체가 다시 그려진다.
 */
function ApplicantCard({
  row,
  onSaved,
  onNotify,
  sending,
}: {
  row: Row;
  onSaved: (patch: Partial<Row>) => void;
  onNotify: (row: Row) => void;
  sending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    status: canonicalStatus(row.status) || "",
    meetingAt: toDateTimeLocalKst(row.meetingAt),
    zoomUrl: row.zoomUrl,
    notice: row.notice,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
    setErr("");
  };

  async function save() {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/applications/${row.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          meetingAt: fromDateTimeLocalKst(draft.meetingAt),
          zoomUrl: draft.zoomUrl,
          notice: draft.notice,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "저장에 실패했습니다.");
      onSaved({
        status: data.status as string,
        meetingAt: (data.meetingAt as string) ?? "",
        zoomUrl: data.zoomUrl as string,
        notice: data.notice as string,
      });
      setSaved(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const when = row.meetingAt ? formatMeetingAt(row.meetingAt) : "";

  return (
    <li className="rounded-[24px] border border-[var(--line)] bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="text-white">{row.name}</strong>
        <span className="text-xs text-[var(--muted)]">{row.position}</span>
        <span className="rounded-full border border-[var(--line)] px-2.5 py-1 text-xs text-[var(--text-dim)]">
          {row.status || "상태 없음"}
        </span>
      </div>

      <p className="mt-2 text-xs break-all text-[var(--muted)]">{row.email}</p>

      {row.preferredSlot && (
        <p className="mt-3 text-sm text-[var(--text-dim)]">
          희망{" "}
          <span className="text-white">{formatSlot(row.preferredSlot)}</span>
          <button
            type="button"
            onClick={() => {
              // 지원자가 원한 시각을 확정 일정으로 그대로 옮긴다. 손으로 옮겨
              // 적다가 시간을 틀리는 것이 이 화면에서 제일 잦은 실수다.
              setDraft((d) => ({ ...d, meetingAt: toDateTimeLocalKst(row.preferredSlot) }));
              setOpen(true);
              setSaved(false);
            }}
            className="ml-2 rounded-full border border-[var(--line)] px-2.5 py-0.5 text-xs text-[var(--muted)] transition-colors hover:text-white"
          >
            이 시간으로
          </button>
        </p>
      )}

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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-xs text-[var(--text-dim)] transition-colors hover:text-white"
          >
            심사 항목
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={() => onNotify(row)}
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#0c0c0c] disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            안내 메일 보내기
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 flex flex-col gap-4 border-t border-[var(--line)] pt-5">
          <label className="block">
            <span className="field-label">상태</span>
            <select
              className="field"
              value={draft.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="">— 없음 —</option>
              {STATUS_FLOW.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="field-label">미팅 일시</span>
            <input
              className="field"
              type="datetime-local"
              value={draft.meetingAt}
              onChange={(e) => set("meetingAt", e.target.value)}
            />
            <span className="mt-2 block text-xs text-[var(--muted)]">
              한국 시간으로 저장됩니다. 비우면 일정이 지워집니다.
            </span>
          </label>

          <label className="block">
            <span className="field-label">줌 링크</span>
            <input
              className="field"
              type="url"
              value={draft.zoomUrl}
              onChange={(e) => set("zoomUrl", e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </label>

          <label className="block">
            <span className="field-label">안내 메시지</span>
            <textarea
              className="field min-h-28 resize-y"
              value={draft.notice}
              onChange={(e) => set("notice", e.target.value)}
              placeholder="메일에 덧붙일 문구. 비워도 됩니다."
            />
          </label>

          {err && (
            <p role="alert" className="field-error block">
              {err}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#0c0c0c] disabled:opacity-40"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              저장
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> 저장했습니다
              </span>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

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
          심사 항목을 여기서 고치고 저장하면 노션에 반영됩니다. 안내 메일은 저장한 내용으로
          나가며, 상태를 바꿨다고 저절로 발송되지는 않습니다.
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
          {rows?.map((row) => (
            <ApplicantCard
              key={row.id}
              row={row}
              sending={sending === row.id}
              onNotify={notify}
              onSaved={(patch) =>
                setRows((prev) => prev?.map((r) => (r.id === row.id ? { ...r, ...patch } : r)) ?? null)
              }
            />
          ))}
        </ul>
      </div>
    </main>
  );
}
