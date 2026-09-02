"use client";

import { AlertCircle, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useUnsavedGuard } from "@/lib/useUnsavedGuard";
import { QNA_MAX_NICKNAME, QNA_MAX_QUESTION, validateQuestion } from "@/lib/validation";

/**
 * 게시판 질문 작성.
 *
 * 등록에 성공하면 서버가 /qna를 재검증하므로 router.refresh()로 목록을
 * 다시 받아 방금 쓴 글이 바로 보이게 한다.
 */
const LEAVE_MESSAGE = "작성 중인 질문이 있습니다. 지금 닫으면 내용이 사라집니다. 닫으시겠습니까?";

export default function QuestionForm({
  onPosted,
  onClose,
}: {
  /** 등록된 글의 id. 부모가 목록에서 그 글로 이동시킨다. */
  onPosted?: (id: string) => void;
  /**
   * 닫기 버튼을 붙인다. 쓰던 내용을 잃는 경로라 확인은 이 컴포넌트가 한다 —
   * 무엇이 얼마나 쓰였는지는 여기만 안다.
   */
  onClose?: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ nickname: "", question: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);

  // 닉네임만 적힌 상태는 잃을 게 없다. 질문 본문이 있을 때만 붙잡는다.
  const dirty = !done && values.question.trim().length > 0;
  useUnsavedGuard(dirty, LEAVE_MESSAGE);

  function requestClose() {
    if (dirty && !window.confirm(LEAVE_MESSAGE)) return;
    onClose?.();
  }

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
      className="relative rounded-[24px] border border-[var(--line)] bg-white/[0.03] p-5 pr-14 sm:p-6 sm:pr-16"
    >
      {onClose && (
        <button
          type="button"
          onClick={requestClose}
          aria-label="닫기"
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}

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
          <span>
            질문이 등록되었습니다. 닫으면 목록에서 방금 남긴 글을 확인할 수 있습니다.
          </span>
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
