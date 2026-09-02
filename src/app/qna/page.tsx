import type { Metadata } from "next";
import Link from "next/link";
import QuestionForm from "@/components/QuestionForm";
import { listQuestions, type QnaEntry } from "@/lib/qna";

export const metadata: Metadata = {
  title: "Q&A",
  description: "지원 전 궁금한 점을 남기면 운영진이 답변합니다.",
};

// 답변은 노션에서 달린다. 사이트가 그 변화를 알 방법이 없으니 주기적으로 다시 읽는다.
export const revalidate = 60;

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeZone: "Asia/Seoul",
  }).format(d);
}

function Entry({ entry }: { entry: QnaEntry }) {
  const answered = !!entry.answer;

  return (
    <article className="border-t border-[var(--line)] py-8">
      <div className="flex flex-wrap items-center gap-3">
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

      <p className="body-copy mt-4 break-keep whitespace-pre-wrap text-white">{entry.question}</p>

      {answered && (
        <div className="mt-5 rounded-[20px] border border-[var(--line)] bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
              Answer
            </span>
            <span className="text-xs text-[var(--muted)]">· {entry.answeredBy}</span>
            {entry.answeredAt && (
              <span className="text-xs text-[var(--muted)]/60">{formatDate(entry.answeredAt)}</span>
            )}
          </div>
          <p className="body-copy mt-3 break-keep whitespace-pre-wrap text-[var(--text-dim)]">
            {entry.answer}
          </p>
        </div>
      )}
    </article>
  );
}

export default async function QnaPage() {
  let entries: QnaEntry[] = [];
  let failed = false;

  try {
    entries = await listQuestions();
  } catch (e) {
    // 노션이 막혀도 질문 작성 폼까지 같이 죽이지는 않는다.
    console.error("[qna] 목록 조회 실패:", e);
    failed = true;
  }

  const answered = entries.filter((e) => e.answer).length;

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-16 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="font-display text-xs tracking-widest text-[var(--muted)] uppercase transition-colors hover:text-white"
        >
          &lt; 모집 공고
        </Link>

        <h1 className="mt-6 mb-4 text-2xl font-medium text-white md:text-3xl">Q&amp;A</h1>
        <p className="body-copy mb-12 break-keep text-[var(--text-dim)]/60">
          지원 전 궁금한 점을 남겨주세요. 운영진이 확인하고 답변을 답니다.
          {entries.length > 0 && (
            <>
              {" "}
              <span className="text-[var(--muted)]">
                (질문 {entries.length}개 · 답변 완료 {answered}개)
              </span>
            </>
          )}
        </p>

        <QuestionForm />

        <section className="mt-14">
          {failed ? (
            <p className="rounded-[20px] border border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              질문 목록을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
            </p>
          ) : entries.length === 0 ? (
            <p className="rounded-[20px] border border-[var(--line)] px-6 py-10 text-center text-sm text-[var(--muted)]">
              아직 등록된 질문이 없습니다. 첫 질문을 남겨보세요.
            </p>
          ) : (
            <div className="flex flex-col">
              {entries.map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
