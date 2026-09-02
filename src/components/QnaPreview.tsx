import Link from "next/link";
import { listQuestions } from "@/lib/qna";

/**
 * 랜딩에 얹는 Q&A 맛보기.
 *
 * 게시판을 잘 만들어도 진입로가 버튼 하나뿐이면 있는 줄 모르고 지나간다.
 * 이미 답변된 질문 몇 개를 미리 보여주면, 그 자체로 궁금증이 풀리기도 하고
 * 게시판이 살아 있다는 신호도 된다.
 *
 * 답변된 글이 하나도 없으면 아무것도 그리지 않는다. 빈 껍데기를 보여주느니
 * CTA만 남기는 편이 낫다.
 */
const PREVIEW_COUNT = 3;

export default async function QnaPreview() {
  let answered: Awaited<ReturnType<typeof listQuestions>> = [];

  try {
    const all = await listQuestions(30);
    answered = all.filter((e) => e.answer).slice(0, PREVIEW_COUNT);
  } catch {
    // 노션이 막혀도 랜딩은 그대로 떠야 한다.
    return null;
  }

  if (answered.length === 0) return null;

  return (
    <div className="mx-auto mb-10 max-w-2xl">
      <p className="font-display mb-5 text-center text-xs tracking-widest text-[var(--muted)] uppercase">
        Recently Answered
      </p>

      <ul className="flex flex-col gap-3">
        {answered.map((e) => (
          <li key={e.id}>
            <Link
              href={`/qna#qna-${e.id}`}
              className="block rounded-[20px] border border-[var(--line)] bg-white/[0.03] p-5 transition-colors hover:border-white/25"
            >
              <div className="flex gap-3">
                <span aria-hidden className="font-display shrink-0 text-sm leading-6 text-[#c98a94]">
                  Q
                </span>
                <p className="line-clamp-2 min-w-0 text-sm leading-6 break-keep text-white">
                  {e.question}
                </p>
              </div>
              <div className="mt-3 flex gap-3">
                <span aria-hidden className="font-display shrink-0 text-sm leading-6 text-[#e3c8bd]">
                  A
                </span>
                <p className="line-clamp-2 min-w-0 text-sm leading-6 break-keep text-[var(--text-dim)]/70">
                  {e.answer}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
