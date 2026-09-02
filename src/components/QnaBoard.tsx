"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

function Row({ entry, highlighted }: { entry: NumberedEntry; highlighted: boolean }) {
  const answered = !!entry.answer;

  return (
    <article
      id={`qna-${entry.id}`}
      className={`scroll-mt-8 border-t border-[var(--line)] py-7 transition-colors duration-700 ${
        // 방금 등록한 글을 잠시 물들여, 목록 어디에 들어갔는지 눈으로 잡히게 한다.
        highlighted ? "-mx-4 rounded-2xl bg-white/[0.06] px-4" : ""
      }`}
    >
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
        {highlighted && (
          <span className="rounded-full bg-[#c98a94]/20 px-2.5 py-0.5 text-xs text-[#e3c8bd]">
            방금 등록
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <span aria-hidden className="font-display shrink-0 text-sm leading-6 text-[#c98a94]">
          Q
        </span>
        <p className="body-copy min-w-0 break-keep whitespace-pre-wrap text-white">
          {entry.question}
        </p>
      </div>

      {answered && (
        <div className="mt-5 rounded-[18px] border border-[var(--line)] bg-white/[0.04] p-5 sm:ml-7">
          <div className="flex gap-3">
            <span aria-hidden className="font-display shrink-0 text-sm leading-6 text-[#e3c8bd]">
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
  const [postedId, setPostedId] = useState<string | null>(null);
  // 모달을 열 때마다 폼을 새로 마운트해, 지난번 등록 완료 문구가 남지 않게 한다.
  const [openCount, setOpenCount] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal()을 써야 포커스 트랩·배경 비활성화·::backdrop이 전부 따라온다.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (formOpen && !d.open) d.showModal();
    else if (!formOpen && d.open) d.close();

    // 모달 뒤 게시판이 같이 스크롤되지 않게 잠근다.
    document.body.style.overflow = formOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [formOpen]);

  // 목록은 최신순으로 들어온다. 가장 오래된 글이 1번이 되도록 뒤에서부터 센다.
  const numbered = useMemo<NumberedEntry[]>(
    () => entries.map((e, i) => ({ ...e, no: entries.length - i })),
    [entries],
  );

  // 등록 직후: 서버가 목록을 다시 내려주면 그 글로 스크롤하고 잠시 강조한다.
  // entries가 갱신될 때마다 확인하므로, refresh가 늦게 끝나도 놓치지 않는다.
  useEffect(() => {
    // 모달이 떠 있는 동안은 뒤가 가려져 있으니, 닫힌 뒤에 이동한다.
    if (!postedId || formOpen) return;
    const el = document.getElementById(`qna-${postedId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setPostedId(null), 3200);
    return () => clearTimeout(t);
  }, [postedId, entries, formOpen]);

  const answeredCount = numbered.filter((e) => e.answer).length;
  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "전체", count: numbered.length },
    { key: "answered", label: "답변 완료", count: answeredCount },
    { key: "waiting", label: "답변 대기", count: numbered.length - answeredCount },
  ];

  const shown = numbered.filter((e) =>
    filter === "all" ? true : filter === "answered" ? !!e.answer : !e.answer,
  );

  const hasList = !failed && numbered.length > 0;

  return (
    <>
      <div className="lg:flex lg:items-start lg:gap-16">
        {/*
          넓은 화면에서는 제목·설명·필터를 왼쪽 기둥으로 세운다. 한 줄로 길게
          늘어놓으면 양옆이 비고, 목록을 읽는 동안 필터가 화면 밖으로 나간다.
          sticky로 붙여 스크롤 중에도 필터에 손이 닿게 한다.
        */}
        <aside className="lg:sticky lg:top-16 lg:w-60 lg:shrink-0">
          <Link
            href="/"
            className="font-display text-xs tracking-widest text-[var(--muted)] uppercase transition-colors hover:text-white"
          >
            &lt; 모집 공고
          </Link>

          <h1 className="mt-6 text-2xl font-medium text-white md:text-3xl">Q&amp;A</h1>
          <p className="body-copy mt-4 break-keep text-[var(--text-dim)]/60">
            지원 전 궁금한 점을 남겨주세요. {ANSWERER}이 확인하고 답변을 답니다.
          </p>

          <button
            type="button"
            onClick={() => {
              setOpenCount((n) => n + 1);
              setFormOpen(true);
            }}
            className="btn-ghost mt-6 inline-flex items-center gap-2 px-6 py-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> 질문 남기기
          </button>

          {hasList && (
            <div className="mt-8 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilter(t.key)}
                  aria-pressed={filter === t.key}
                  className={`rounded-full border px-4 py-2 text-xs transition-colors lg:flex lg:w-full lg:items-center lg:justify-between ${
                    filter === t.key
                      ? "border-white bg-white font-medium text-[#0c0c0c]"
                      : "border-[var(--line)] text-[var(--muted)] hover:text-white"
                  }`}
                >
                  <span>{t.label}</span> <span className="tabular">{t.count}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="mt-10 min-w-0 flex-1 lg:mt-0">
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
                <Row key={entry.id} entry={entry} highlighted={entry.id === postedId} />
              ))}
            </div>
          )}
          </div>
      </div>

      {/*
        질문 폼은 게시판 위에 띄운다. 목록은 그대로 두고 뒤를 흐려,
        지금 무엇을 하는 중인지가 분명해진다.

        onCancel을 막아 ESC로 닫히지 않게 한다. 배경 클릭도 닫지 않는다 —
        쓰던 글이 실수로 날아가는 걸 막는 게 이 화면에서는 접근성보다 앞선다.
        닫는 길은 X 버튼 하나뿐이다.
      */}
      <dialog
        ref={dialogRef}
        onCancel={(e) => e.preventDefault()}
        aria-label="질문 남기기"
        className="m-auto w-[calc(100%-2rem)] max-w-xl bg-transparent p-0 text-[var(--text-dim)] backdrop:bg-black/55 backdrop:backdrop-blur-md"
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            aria-label="닫기"
            className="absolute top-4 right-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-[#0c0c0c] text-[var(--muted)] transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <QuestionForm
            key={openCount}
            onPosted={(id) => {
              // 새 글은 언제나 "답변 대기"다. 답변 완료 탭에 있으면 안 보인다.
              setFilter("all");
              setPostedId(id);
            }}
          />
        </div>
      </dialog>
    </>
  );
}
