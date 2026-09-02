"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { openPositions, positionById, positions, site } from "@/config/site";
import { SELECT_POSITION_EVENT } from "@/components/PositionApplyButton";
import { formatPhone, normalizeUrl } from "@/lib/format";
import { captureRef, readRef } from "@/lib/ref";
import { useUnsavedGuard } from "@/lib/useUnsavedGuard";
import { ANSWER_MAX, validateApplication } from "@/lib/validation";

const DRAFT_KEY = "recruit:draft:v1";

/** 진행률 막대 색. 가로·세로 두 곳에서 같은 색을 써야 해서 상수로 뺐다. */
const PROGRESS_GRADIENT = "linear-gradient(90deg, #8a5c58, #c98a94, #e3c8bd)";
const PROGRESS_GRADIENT_V = "linear-gradient(180deg, #8a5c58, #c98a94, #e3c8bd)";

export interface FormValues {
  name: string;
  email: string;
  phone: string;
  position: string;
  oneLiner: string;
  motivation: string;
  experience: string;
  portfolio: string;
  availability: string;
  agree: boolean;
  answers: Record<string, string>;
}

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  position: "",
  oneLiner: "",
  motivation: "",
  experience: "",
  portfolio: "",
  availability: "",
  agree: false,
  answers: {},
};

type Errors = Record<string, string>;

export default function ApplyForm({
  mode = "create",
  initial,
  token,
  applicationId,
  editable = true,
}: {
  mode?: "create" | "edit";
  initial?: Partial<FormValues>;
  token?: string;
  applicationId?: string;
  editable?: boolean;
}) {
  const [values, setValues] = useState<FormValues>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ editUrl?: string; mailed?: boolean } | null>(null);
  const [saved, setSaved] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);

  /* ── 이탈 방지 ────────────────────────────────────────────── */
  // 처음 들어왔을 때의 값. 여기서 달라진 게 있으면 "쓰던 중"이다.
  // 신규 작성은 임시저장이 복원되면 그 값이 기준이 되므로, 불러오기만 하고
  // 나가는 경우에는 붙잡지 않는다.
  // ref로 두면 렌더 중에 읽게 되어 규칙에 걸린다. 값 자체가 렌더 결과를
  // 바꾸므로 state가 맞다.
  const [baseline, setBaseline] = useState(() => JSON.stringify({ ...EMPTY, ...initial }));
  const dirty = !done && JSON.stringify(values) !== baseline;

  useUnsavedGuard(
    dirty,
    mode === "edit"
      ? // 수정 화면은 임시저장이 없다. 저장하지 않으면 그대로 사라진다.
        "저장하지 않은 수정 내용이 있습니다. 지금 나가면 수정한 내용이 사라집니다. 나가시겠습니까?"
      : "작성 중인 지원서가 있습니다. 이 브라우저에는 임시 저장되지만 다른 기기에서는 이어서 쓸 수 없습니다. 나가시겠습니까?",
  );

  const selectable = mode === "create" ? openPositions : positions;
  const position = positionById(values.position);

  /* ── 임시저장 (신규 작성일 때만) ───────────────────────────── */
  useEffect(() => {
    if (mode !== "create") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      // localStorage는 서버에 없으므로 초기 state로 넣으면 하이드레이션이 깨진다.
      // 마운트 후 복원이 유일하게 안전한 방법이라 이 규칙만 예외로 둔다.
      if (raw) {
        const restored: FormValues = { ...EMPTY, ...JSON.parse(raw) };
        /* eslint-disable react-hooks/set-state-in-effect */
        setBaseline(JSON.stringify(restored));
        setValues(restored);
        /* eslint-enable react-hooks/set-state-in-effect */
      }
    } catch {
      /* 저장소를 못 쓰는 브라우저여도 폼은 동작해야 한다 */
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "create") return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        /* noop */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [values, mode]);

  /* ── 유입 경로 ────────────────────────────────────────────── */
  useEffect(() => {
    if (mode === "create") captureRef();
  }, [mode]);

  /* ── 포지션 카드에서 넘어온 선택 ─────────────────────────── */
  useEffect(() => {
    if (mode !== "create") return;

    const apply = (id: string) => {
      const target = positionById(id);
      if (!target?.open) return;
      setValues((v) => (v.position === id ? v : { ...v, position: id, answers: {} }));
      setErrors((e) => {
        if (!e.position) return e;
        const next = { ...e };
        delete next.position;
        return next;
      });
    };

    // 1) 포지션 카드 버튼 클릭
    const onSelect = (e: Event) => apply((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_POSITION_EVENT, onSelect);

    // 2) 외부에서 들어온 딥링크 (?position=frontend)
    const fromQuery = new URLSearchParams(window.location.search).get("position");
    if (fromQuery) apply(fromQuery);

    return () => window.removeEventListener(SELECT_POSITION_EVENT, onSelect);
  }, [mode]);

  const set = useCallback(<K extends keyof FormValues>(key: K, val: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }, []);

  const setAnswer = useCallback((id: string, val: string) => {
    setValues((v) => ({ ...v, answers: { ...v.answers, [id]: val } }));
    setErrors((e) => {
      const k = `answers.${id}`;
      if (!e[k]) return e;
      const next = { ...e };
      delete next[k];
      return next;
    });
  }, []);

  /* ── 진행률 ──────────────────────────────────────────────── */
  // 붙었는지 여부. 붙었을 때만 배경과 경계선을 줘서, 폼 맨 위에서는
  // 그냥 인라인 요소처럼 보이고 스크롤을 시작하면 바가 된다.
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // 센티널이 화면 위로 밀려 나가면 진행률 바가 붙은 것이다.
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {
      threshold: 1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const progress = useMemo(() => {
    const required: boolean[] = [
      !!values.name,
      !!values.email,
      !!values.position,
      !!values.oneLiner,
      !!values.motivation,
      !!values.availability,
      values.agree,
      ...(position?.questions.filter((q) => q.required).map((q) => !!values.answers[q.id]) ?? []),
    ];
    return Math.round((required.filter(Boolean).length / required.length) * 100);
  }, [values, position]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !editable) return;

    // 서버와 같은 규칙으로 먼저 검사해 왕복 없이 즉시 알려준다.
    // 서버 검증은 그대로 유지된다 — API를 직접 때리는 요청을 막아야 하기 때문.
    const local = validateApplication(
      { ...values, agree: values.agree },
      { requirePosition: mode === "create" },
    );
    if (!local.ok) {
      setErrors(local.errors as Errors);
      setNotice("입력하지 않았거나 형식이 맞지 않는 항목이 있습니다.");
      // 인라인 표시만으로는 화면 밖 항목을 놓치기 쉬워 즉시 알림도 함께 띄운다.
      window.alert("필수 항목을 작성해주세요.");
      focusFirstError(local.errors as Errors);
      return;
    }

    setBusy(true);
    setNotice(null);
    setErrors({});

    const payload = {
      ...values,
      ref: mode === "create" ? readRef() : undefined,
      company: honeypot.current?.value ?? "",
      ...(mode === "edit" ? { token } : {}),
    };

    const url = mode === "edit" ? `/api/applications/${applicationId}` : "/api/apply";

    try {
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setNotice("입력하지 않은 항목이 있습니다. 아래를 확인해 주세요.");
        focusFirstError(data.errors);
        return;
      }
      if (!res.ok) {
        setNotice(data.error ?? "문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      if (mode === "edit") {
        // 저장에 성공했으니 지금 값이 새 기준이다. 그대로 두면 이탈 방지가
        // 계속 붙잡는다.
        setBaseline(JSON.stringify(values));
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* noop */
        }
        setDone({ editUrl: data.editUrl, mailed: data.mailed });
      }
    } catch {
      setNotice("네트워크 오류입니다. 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  /* ── 접수 완료 화면 ───────────────────────────────────────── */
  if (done) {
    return (
      <div className="mx-auto max-w-2xl rounded-[32px] border border-[var(--line)] bg-white/[0.03] p-8 text-center md:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white">
          <Check className="h-7 w-7 text-[#0c0c0c]" strokeWidth={3} />
        </div>
        <h3 className="mt-6 text-xl font-medium text-white">지원이 접수되었습니다</h3>
        <p className="body-copy mt-3 text-[var(--text-dim)]/70">
          {done.mailed
            ? "입력하신 이메일로 접수 확인 메일을 보냈습니다. 메일 안의 링크에서 지원 내용을 언제든 수정하고 심사 상태를 확인할 수 있습니다."
            : "지원서는 정상 접수되었습니다. 아래 링크를 저장해 두시면 지원 내용을 수정하고 심사 상태를 확인할 수 있습니다."}
        </p>
        {done.editUrl && (
          <a
            href={done.editUrl}
            className="btn-cta mt-7 inline-block px-8 py-3.5 text-xs sm:text-sm"
          >
            내 지원서 확인하기
          </a>
        )}
        <p className="mt-5 text-xs text-[var(--muted)]">
          이 링크는 본인만 접근할 수 있습니다. 다른 사람과 공유하지 말아주세요.
        </p>
      </div>
    );
  }

  return (
    <form id="apply-form" onSubmit={submit} noValidate className="relative mx-auto max-w-2xl">
      {/*
        진행률은 폼을 내려가는 내내 보여야 한다. 화면 폭에 따라 자리를 달리 잡는다.
        좁은 화면에서는 위에 떠 있는 알약, 넓은 화면에서는 폼 왼쪽 여백의 세로 레일.
      */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/* 좁은 화면: 상단에 떠 있는 알약 */}
      <div className="sticky top-4 z-20 mb-8 lg:hidden">
        <div
          className={`flex items-center gap-3 rounded-full border px-5 py-2.5 transition-colors duration-300 ${
            stuck
              ? "border-[var(--line)] bg-[#0c0c0c]/90 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md"
              : "border-[var(--line)] bg-[#0c0c0c]/60"
          }`}
        >
          <span className="font-display shrink-0 text-[0.7rem] tracking-widest text-[var(--muted)] uppercase">
            Progress
          </span>
          <div
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="작성 진행률"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{ width: `${progress}%`, background: PROGRESS_GRADIENT }}
            />
          </div>
          <span
            className="font-display w-10 shrink-0 text-right text-xs text-white tabular"
            aria-live="polite"
          >
            {progress}%
          </span>
        </div>
      </div>

      {/*
        넓은 화면: 폼 왼쪽 여백의 세로 레일.
        absolute로 폼 높이만큼 자리를 잡고 그 안의 sticky가 따라 내려간다.
        본문 폭을 건드리지 않으므로 가운데 정렬된 제목과 어긋나지 않는다.

        폭 계산(기준 1024px): 섹션 좌우 여백 40px, 폼 672px가 가운데 →
        폼 왼쪽 끝이 화면 176px 지점. 레일을 160px 당겨 128px 폭으로 두면
        화면 16px에서 시작해 폼과 32px 간격이 남는다. 여기보다 좁으면
        레일이 화면 밖으로 나가므로 그때는 위쪽 알약을 쓴다.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-40 hidden w-32 lg:block"
      >
        <div className="sticky top-28 flex gap-4">
          <div className="relative h-40 w-[3px] shrink-0 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-x-0 top-0 rounded-full transition-[height] duration-500"
              style={{ height: `${progress}%`, background: PROGRESS_GRADIENT_V }}
            />
          </div>
          <div className="flex h-40 flex-col justify-between py-0.5">
            <div>
              <p className="font-display text-[0.7rem] tracking-widest text-[var(--muted)] uppercase">
                Progress
              </p>
              <p className="font-display mt-2 text-[1.75rem] leading-none text-white tabular">
                {progress}%
              </p>
            </div>
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              작성 진행률
              <br />
              필수 항목 기준
            </p>
          </div>
        </div>
      </div>

      <p className="mb-6 text-xs text-[var(--muted)]">
        <span className="text-[#c98a94]">*</span> 표시는 필수 항목입니다.
      </p>

      {notice && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 flex items-start gap-2.5 rounded-2xl border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-4 py-3 text-sm text-[#ffb3b3]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Field label="이름"
          name="name" required error={errors.name}>
          <input
            className="field"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
            autoComplete="name"
            placeholder="홍길동"
          />
        </Field>

        <Field
          label="이메일"
          name="email"
          required
          error={errors.email}
          hint={
            mode === "edit"
              ? "이메일은 본인 확인 기준이라 변경할 수 없습니다."
              : "지원 확인과 수정 링크를 여기로 보냅니다. 오타가 있으면 연락드릴 수 없습니다."
          }
        >
          <input
            className="field"
            type="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={!!errors.email}
            autoComplete="email"
            disabled={mode === "edit"}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="연락처"
          name="phone" error={errors.phone} hint="선택 항목입니다.">
          <input
            className="field"
            type="tel"
            inputMode="numeric"
            value={values.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
            aria-invalid={!!errors.phone}
            autoComplete="tel"
            placeholder="010-0000-0000"
          />
        </Field>

        <Field label="지원 포지션"
          name="position" required error={errors.position} as="group">
          <div className="grid gap-2 sm:grid-cols-2">
            {selectable.map((p) => {
              const active = values.position === p.id;
              const locked = mode === "create" && !p.open;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={locked}
                  // 눌린 상태를 알려주지 않으면 무엇이 선택됐는지 읽어줄 방법이 없다.
                  aria-pressed={active}
                  onClick={() => set("position", p.id)}
                  className={`rounded-2xl border px-4 py-3.5 text-left transition ${
                    active
                      ? "border-white/70 bg-white/10"
                      : "border-[var(--line)] bg-white/[0.03] hover:border-white/30"
                  } ${locked ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <span className="font-display block text-xs text-[var(--muted)]">{p.no}</span>
                  <span className="mt-1 block text-sm text-white">{p.title}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label="한 줄 소개"
          name="oneLiner"
          required
          error={errors.oneLiner}
          hint={`${values.oneLiner.length} / 60자`}
        >
          <input
            className="field"
            maxLength={60}
            value={values.oneLiner}
            onChange={(e) => set("oneLiner", e.target.value)}
            aria-invalid={!!errors.oneLiner}
            placeholder="나를 한 문장으로 소개한다면"
          />
        </Field>

        <Field
          label="지원 동기"
          name="motivation"
          required
          error={errors.motivation}
          hint="프로젝트를 끝까지 함께할 수 있는지를 가장 중요하게 봅니다."
        >
          <textarea
            className="field min-h-36 resize-y"
            value={values.motivation}
            onChange={(e) => set("motivation", e.target.value)}
            aria-invalid={!!errors.motivation}
            placeholder="이 프로젝트에 지원한 이유와, 3개월 이상 꾸준히 참여할 수 있는 상황인지 적어주세요."
          />
        </Field>

        <Field label="관련 경험"
          name="experience" error={errors.experience} hint="선택 항목입니다.">
          <textarea
            className="field min-h-28 resize-y"
            value={values.experience}
            onChange={(e) => set("experience", e.target.value)}
            placeholder="프로젝트, 동아리, 인턴, 개인 학습 등 무엇이든 좋습니다."
          />
        </Field>

        <Field
          label="포트폴리오 / GitHub 링크"
          name="portfolio"
          error={errors.portfolio}
          hint="파일 업로드는 받지 않습니다. GitHub · Notion · Behance · PDF 링크를 넣어주세요."
        >
          <input
            className="field"
            type="url"
            value={values.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
            onBlur={(e) => set("portfolio", normalizeUrl(e.target.value))}
            aria-invalid={!!errors.portfolio}
            placeholder="github.com/... (https:// 는 자동으로 붙습니다)"
          />
        </Field>

        <Field label="주간 참여 가능 시간"
          name="availability" required error={errors.availability} as="group">
          <div className="flex flex-wrap gap-2">
            {site.availability.map((a) => (
              <button
                key={a}
                type="button"
                aria-pressed={values.availability === a}
                onClick={() => set("availability", a)}
                className={`rounded-full border px-4 py-2.5 text-sm transition ${
                  values.availability === a
                    ? "border-white/70 bg-white/10 text-white"
                    : "border-[var(--line)] text-[var(--text-dim)]/70 hover:border-white/30"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>

        {/* 포지션 분기 질문 */}
        {position && (
          <div className="flex flex-col gap-6 rounded-[24px] border border-[var(--line)] bg-white/[0.02] p-5 md:p-6">
            <p className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
              {position.title} 지원자 질문
            </p>
            {position.questions.map((q) => (
              <Field
                key={q.id}
                label={q.label}
                name={`answers.${q.id}`}
                required={q.required}
                error={errors[`answers.${q.id}`]}
                hint={`${(values.answers[q.id] ?? "").length} / ${ANSWER_MAX}자`}
              >
                <textarea
                  className="field min-h-28 resize-y"
                  maxLength={ANSWER_MAX}
                  value={values.answers[q.id] ?? ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  aria-invalid={!!errors[`answers.${q.id}`]}
                  placeholder={q.placeholder}
                />
              </Field>
            ))}
          </div>
        )}

        {/* 개인정보 동의 */}
        <div>
          {/*
            보관 안내는 라벨 밖으로 뺀다. 라벨 안에 두면 체크박스 이름이
            "개인정보 수집·이용에 동의합니다.수집 항목 보기 수집된 개인정보는…"
            으로 통째로 읽힌다. 이름은 동의 문구만, 안내는 설명으로 넘긴다.
          */}
          <div className="text-sm text-[var(--text-dim)]">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.agree}
                onChange={(e) => set("agree", e.target.checked)}
                aria-invalid={!!errors.agree}
                aria-describedby="agree-notice"
                required
                className="mt-0.5 h-4 w-4 shrink-0 accent-white"
              />
              <span>
                개인정보 수집·이용에 동의합니다.{" "}
                <a href="/privacy" target="_blank" className="underline underline-offset-4">
                  수집 항목 보기
                </a>
              </span>
            </label>
            <span id="agree-notice" className="mt-1 block pl-7 text-xs text-[var(--muted)]">
              {site.privacyNotice}
            </span>
          </div>
          {errors.agree && <p className="field-error">{errors.agree}</p>}
        </div>

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

        <div className="mt-2 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn-cta px-9 py-4 text-xs sm:text-sm" disabled={busy || !editable}>
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "edit" ? "저장 중" : "제출 중"}
              </span>
            ) : mode === "edit" ? (
              "수정 내용 저장"
            ) : (
              "지원서 제출"
            )}
          </button>

          {saved && (
            <span className="inline-flex items-center gap-2 text-sm text-[#9ee6a5]" role="status">
              <Check className="h-4 w-4" /> 저장되었습니다
            </span>
          )}

          {mode === "create" && (
            <span className="text-xs text-[var(--muted)]">
              작성 중인 내용은 이 브라우저에 자동 저장됩니다.
            </span>
          )}
        </div>

        {!editable && (
          <p className="text-sm text-[#ffb3b3]">
            모집이 마감되어 더 이상 수정할 수 없습니다. 내용 확인만 가능합니다.
          </p>
        )}
      </div>
    </form>
  );
}

/** 첫 번째 오류 항목으로 스크롤하고 포커스를 옮긴다. */
function focusFirstError(errors: Errors) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  const el = document.querySelector<HTMLElement>(`[data-field="${first}"] [aria-invalid="true"], [data-field="${first}"] input, [data-field="${first}"] textarea`);
  const target = el ?? document.getElementById("apply-form");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el && "focus" in el) setTimeout(() => el.focus({ preventScroll: true }), 320);
}

/**
 * 라벨 · 힌트 · 오류를 한 벌로 묶는다.
 *
 * 예전에는 <label>이 힌트와 오류까지 감싸고 있어서, 스크린리더가 필드 이름을
 * "이메일 지원 확인과 수정 링크를 여기로 보냅니다. 오타가 있으면…"처럼 통째로
 * 읽었다. 라벨은 이름만 맡고 설명은 aria-describedby로 넘긴다.
 *
 * 선택 버튼 묶음처럼 폼 컨트롤이 하나가 아닌 경우에는 <label>을 쓸 수 없다.
 * (label은 컨트롤 하나를 가리키는 요소다.) group으로 렌더해 aria-labelledby로
 * 묶음 전체에 이름을 준다.
 */
function Field({
  label,
  required,
  hint,
  error,
  name,
  as = "label",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  name?: string;
  /** 컨트롤이 여럿이면 "group" — 버튼 묶음 등 */
  as?: "label" | "group";
  children: React.ReactNode;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter(Boolean)
    .join(" ");

  const heading = (
    <span className="field-label" id={labelId}>
      {label}
      {required && (
        <span className="ml-1 text-[#c98a94]" aria-hidden>
          *
        </span>
      )}
    </span>
  );

  const notes = (
    <>
      {hint && !error && (
        <span id={hintId} className="mt-2 block text-xs text-[var(--muted)]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error block" role="alert">
          {error}
        </span>
      )}
    </>
  );

  if (as === "group") {
    return (
      <div className="block" data-field={name} role="group" aria-labelledby={labelId}>
        {heading}
        {children}
        {notes}
      </div>
    );
  }

  // 컨트롤에 id와 설명 연결을 직접 꽂는다. 호출부마다 적어주면 빠뜨리기 쉽다.
  const control =
    React.isValidElement(children) &&
    React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      id,
      required,
      "aria-required": required || undefined,
      "aria-describedby": describedBy || undefined,
    });

  return (
    <div className="block" data-field={name}>
      <label htmlFor={id}>{heading}</label>
      {control || children}
      {notes}
    </div>
  );
}
