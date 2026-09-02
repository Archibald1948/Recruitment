"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { CONTACT_MAX_MESSAGE, validateContact } from "@/lib/validation";

/**
 * 지원 전 문의.
 *
 * 지원서를 쓰다가 막히거나 망설이는 순간에 바로 물어볼 곳이 필요하다.
 * 팀장 주소는 화면에 노출하지 않고 서버에서만 쓴다.
 */
export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof values, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const local = validateContact(values);
    if (!local.ok) {
      setErrors(local.errors as Record<string, string>);
      setNotice("입력하지 않았거나 형식이 맞지 않는 항목이 있습니다.");
      return;
    }

    setBusy(true);
    setNotice(null);
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot.current?.value ?? "" }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setNotice("입력을 다시 확인해 주세요.");
        return;
      }
      if (!res.ok) {
        setNotice(data.error ?? "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      setSent(true);
    } catch {
      setNotice("네트워크 오류입니다. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl rounded-[24px] border border-[var(--line)] bg-white/[0.03] p-8 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white">
          <Check className="h-5 w-5 text-[#0c0c0c]" strokeWidth={3} />
        </div>
        <p className="mt-4 text-sm text-white">문의가 전달되었습니다.</p>
        <p className="mt-2 text-xs text-[var(--text-dim)]/60">
          남겨주신 이메일로 답장드리겠습니다.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-[var(--text-dim)]/60">
          지원 전에 궁금한 점이 있으신가요?
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-ghost mt-4 px-7 py-3 text-xs"
        >
          문의하기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-xl">
      <h3 className="mb-6 text-center text-sm font-medium text-white">문의하기</h3>

      {notice && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffb3b3]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <label className="block">
          <span className="field-label">
            이름<span className="ml-1 text-[#c98a94]">*</span>
          </span>
          <input
            className="field"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            autoComplete="name"
            placeholder="홍길동"
          />
          {errors.name && <span className="field-error block">{errors.name}</span>}
        </label>

        <label className="block">
          <span className="field-label">
            답장받을 이메일<span className="ml-1 text-[#c98a94]">*</span>
          </span>
          <input
            className="field"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!errors.email}
            autoComplete="email"
            placeholder="you@example.com"
          />
          {errors.email && <span className="field-error block">{errors.email}</span>}
        </label>

        <label className="block">
          <span className="field-label">
            문의 내용<span className="ml-1 text-[#c98a94]">*</span>
          </span>
          <textarea
            className="field min-h-32 resize-y"
            maxLength={CONTACT_MAX_MESSAGE}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            aria-invalid={!!errors.message}
            placeholder="궁금한 점을 자유롭게 적어주세요."
          />
          <span className="mt-2 block text-xs text-[var(--muted)]">
            {values.message.length} / {CONTACT_MAX_MESSAGE}자
          </span>
          {errors.message && <span className="field-error block">{errors.message}</span>}
        </label>

        {/* 허니팟 — 사람에게는 보이지 않는다 */}
        <input
          ref={honeypot}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-cta px-7 py-3 text-xs" disabled={busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 보내는 중
              </span>
            ) : (
              "보내기"
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-[var(--muted)] hover:text-white"
          >
            닫기
          </button>
        </div>
      </div>
    </form>
  );
}
