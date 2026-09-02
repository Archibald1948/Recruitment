import type { Metadata } from "next";
import Link from "next/link";
import QnaBoard from "@/components/QnaBoard";
import { listQuestions, type QnaEntry } from "@/lib/qna";

export const metadata: Metadata = {
  title: "Q&A",
  description: "지원 전 궁금한 점을 남기면 운영진이 답변합니다.",
};

// 답변은 노션에서 달린다. 사이트가 그 변화를 알 방법이 없으니 주기적으로 다시 읽는다.
export const revalidate = 60;

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

        <QnaBoard entries={entries} failed={failed} />
      </div>
    </main>
  );
}
