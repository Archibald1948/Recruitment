"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import QuestionForm from "@/components/QuestionForm";
import { ANSWERER, type QnaEntry } from "@/lib/qna";

type Filter = "all" | "answered" | "waiting";

/** 목록에 붙일 글 번호. 필터를 바꿔도 번호가 흔들리지 않게 전체 기준으로 매긴다. */
interface NumberedEntry extends QnaEntry {
  no: number;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(d);
}

function Row({ entry }: { entry: NumberedEntry }) {
  const answered = !!entry.answer;

  return (
    <article className="border-t border-[var(--line)] py-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-display text-xs tracking-widest text-[var(--muted)]/70">
          #{String(entry.no).padStart(3, "0")}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            answered
              ? "bg-white text-[#0c0c0c]"
              : "border border-[var(--line)] text-[var(--muted)]"
          }`}
        >
          {answered ? "답변 완료" : "답변 대기"}
        </span>
        <span className="text-xs text-[var(--muted)]">{entry.nickname || "익명"}</span>
        <span className="text-xs text-[var(--muted)]/60">{formatDate(entry.createdAt)}</span>
      </div>

      <div className="mt-4 flex gap-3">
        <span
          aria-hidden
          className="font-display shrink-0 text-sm leading-6 text-[#c98a94]"
        >
          Q
        </span>
        <p className="body-copy min-w-0 break-keep whitespace-pre-wrap text-white">
          {entry.question}
        </p>
      </div>

      {answered && (
        <div className="mt-5 rounded-[18px] border border-[var(--line)] bg-white/[0.04] p-5 sm:ml-7">
          <div className="flex gap-3">
            <span
              aria-hidden
              className="font-display shrink-0 text-sm leading-6 text-[#e3c8bd]"
            >
              A
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-xs text-white">{ANSWERER}</span>
                {entry.answeredAt && (
                  <span className="text-xs text-[var(--muted)]/60">
                    {formatDate(entry.answeredAt)}
                  </span>
                )}
              </div>
              <p className="body-copy mt-2 break-keep whitespace-pre-wrap text-[var(--text-dim)]">
                {entry.answer}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default function QnaBoard({
  entries,
  failed,
}: {
  entries: QnaEntry[];
  failed: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [formOpen, setFormOpen] = useState(false);

  // 목록은 최신순으로 들어온다. 가장 오래된 글이 1번이 되도록 뒤에서부터 센다.
  const numbered = useMemo<NumberedEntry[]>(
    () => entries.map((e, i) => ({ ...e, no: entries.length - i })),
    [entries],
  );

  const answeredCount = numbered.filter((e) => e.answer).length;
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: numbered.length },
    { key: "answered", label: "답변 완료", count: answeredCount },
    { key: "waiting", label: "답변 대기", count: numbered.length - answeredCount },
  ];

  const shown = numbered.filter((e) =>
    filter === "all" ? true : filter === "answered" ? !!e.answer : !e.answer,
  );

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="body-copy max-w-md break-keep text-[var(--text-dim)]/60">
          지원 전 궁금한 점을 남겨주세요. {ANSWERER}이 확인하고 답변을 답니다.
        </p>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="btn-ghost inline-flex shrink-0 items-center gap-2 px-6 py-3 text-xs"
          aria-expanded={formOpen}
        >
          {formOpen ? (
            <>
              <X className="h-3.5 w-3.5" /> 닫기
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> 질문 남기기
            </>
          )}
        </button>
      </div>

      {formOpen && (
        <div className="mb-12">
          <QuestionForm />
        </div>
      )}

      {!failed && numbered.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              aria-pressed={filter === t.key}
              className={`rounded-full border px-4 py-2 text-xs transition-colors ${
                filter === t.key
                  ? "border-white bg-white font-medium text-[#0c0c0c]"
                  : "border-[var(--line)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {t.label} <span className="tabular">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      <section className="mt-6">
        {failed ? (
          <p className="rounded-[20px] border border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
            질문 목록을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
          </p>
        ) : numbered.length === 0 ? (
          <p className="rounded-[20px] border border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
            아직 등록된 질문이 없습니다. 첫 질문을 남겨보세요.
          </p>
        ) : shown.length === 0 ? (
          <p className="rounded-[20px] border border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
            해당하는 질문이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col border-b border-[var(--line)]">
            {shown.map((entry) => (
              <Row key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
