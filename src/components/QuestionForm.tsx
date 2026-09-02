"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { QNA_MAX_NICKNAME, QNA_MAX_QUESTION, validateQuestion } from "@/lib/validation";

/**
 * 게시판 질문 작성.
 *
 * 등록에 성공하면 서버가 /qna를 재검증하므로 router.refresh()로 목록을
 * 다시 받아 방금 쓴 글이 바로 보이게 한다.
 */
export default function QuestionForm({
  onPosted,
}: {
  /** 등록된 글의 id. 부모가 목록에서 그 글로 이동시킨다. */
  onPosted?: (id: string) => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ nickname: "", question: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
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

    const local = validateQuestion(values);
    if (!local.ok) {
      setErrors(local.errors as Record<string, string>);
      setNotice("입력하지 않았거나 형식이 맞지 않는 항목이 있습니다.");
      return;
    }

    setBusy(true);
    setNotice(null);
    setErrors({});

    try {
      const res = await fetch("/api/qna", {
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

      setValues({ nickname: values.nickname, question: "" });
      setDone(true);
      router.refresh();
      if (typeof data.id === "string") onPosted?.(data.id);
    } catch {
      setNotice("네트워크 오류입니다. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[24px] border border-[var(--line)] bg-white/[0.03] p-5 sm:p-6"
    >
      <h2 className="text-sm font-medium text-white">질문 남기기</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
        남긴 질문과 답변은 이 페이지에 공개됩니다. 개인정보는 적지 말아주세요.
      </p>

      {notice && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffb3b3]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {done && !notice && (
        <div
          aria-live="polite"
          className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[var(--line)] bg-white/[0.05] px-4 py-3 text-sm text-white"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
          <span>질문이 등록되었습니다. 답변이 달리면 이 페이지에 표시됩니다.</span>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        <label className="block">
          <span className="field-label">
            닉네임<span className="ml-1 text-[#c98a94]">*</span>
          </span>
          <input
            className="field"
            value={values.nickname}
            maxLength={QNA_MAX_NICKNAME}
            onChange={(e) => set("nickname", e.target.value)}
            aria-invalid={!!errors.nickname}
            autoComplete="nickname"
            placeholder="예비 지원자"
          />
          {errors.nickname && <span className="field-error block">{errors.nickname}</span>}
        </label>

        <label className="block">
          <span className="field-label">
            질문<span className="ml-1 text-[#c98a94]">*</span>
          </span>
          <textarea
            className="field min-h-32 resize-y"
            maxLength={QNA_MAX_QUESTION}
            value={values.question}
            onChange={(e) => set("question", e.target.value)}
            aria-invalid={!!errors.question}
            placeholder="궁금한 점을 자유롭게 적어주세요."
          />
          <span className="mt-2 block text-xs text-[var(--muted)]">
            {values.question.length} / {QNA_MAX_QUESTION}자
          </span>
          {errors.question && <span className="field-error block">{errors.question}</span>}
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

        <div>
          <button type="submit" className="btn-cta px-7 py-3 text-xs" disabled={busy}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 등록 중
              </span>
            ) : (
              "질문 등록"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
