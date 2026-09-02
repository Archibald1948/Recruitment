"use client";

import { Loader2, Lock } from "lucide-react";
import { useState } from "react";

/**
 * 운영자 잠금 화면.
 *
 * proxy가 세션 없는 /admin 요청을 여기로 바꿔 그린다. 주소는 /admin 그대로라
 * 통과하면 그 자리에서 이어진다.
 *
 * 일부러 아무 설명도 두지 않는다. 어떤 화면으로 들어가는 문인지 알려줄 이유가 없다.
 */
export default function AdminGate() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !password) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 지금 열려 있는 주소가 곧 비밀 경로다. 값을 코드에 박지 않아도 된다.
        body: JSON.stringify({ password, from: window.location.pathname }),
      });
      if (res.ok) {
        // 쿠키가 붙은 뒤 다시 요청해야 proxy가 통과시킨다.
        // 주소는 그대로 두고 다시 연다 — 비밀 경로를 여기 적어둘 필요가 없다.
        window.location.reload();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "잠시 후 다시 시도해 주세요.");
      setPassword("");
    } catch {
      setError("네트워크 오류입니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0c0c0c] px-5">
      <form onSubmit={submit} className="w-full max-w-xs">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-[var(--line)]">
          <Lock className="h-4 w-4 text-[var(--muted)]" />
        </div>

        <label className="mt-8 block">
          <span className="sr-only">운영자 키</span>
          <input
            className="field text-center"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "gate-error" : undefined}
          />
        </label>

        {error && (
          <p id="gate-error" role="alert" className="field-error mt-3 block text-center">
            {error}
          </p>
        )}

        <button type="submit" className="btn-cta mt-5 w-full py-3 text-xs" disabled={busy}>
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> 확인 중
            </span>
          ) : (
            "확인"
          )}
        </button>
      </form>
    </main>
  );
}
