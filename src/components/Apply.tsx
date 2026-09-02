import ApplyForm from "@/components/ApplyForm";
import QnaPreview from "@/components/QnaPreview";
import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import { PixelOrbit, PixelSphere } from "@/components/decor/PixelOrnaments";
import { daysLeft, isClosed, openPositions, site } from "@/config/site";

const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelSphere,
    position: "top-[10%]",
    max: 170,
    delay: 0.1,
    from: "left",
  },
  {
    Shape: PixelOrbit,
    position: "bottom-[8%]",
    max: 180,
    delay: 0.24,
    from: "right",
  },
];

export default function Apply() {
  const closed = isClosed();
  const remaining = daysLeft();

  // overflow는 clip이어야 한다. hidden은 스크롤 컨테이너를 만들어 안쪽
  // 진행률 바의 sticky를 무력화한다. clip은 스크롤포트를 만들지 않고
  // 장식이 가로로 삐져나가는 것만 잘라낸다.
  return (
    <section id="apply" className="relative z-10 overflow-x-clip px-5 py-24 sm:px-8 md:px-10 md:py-32">
      <SectionDecor items={ORNAMENTS} content={768} opacity="opacity-40" />

      <FadeIn>
        <h2 className="section-heading grad-heading font-display relative z-10 text-center">Apply</h2>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="mx-auto mt-6 mb-14 flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="body-copy text-[var(--text-dim)]/70">
            처음부터 완벽한 서비스를 만드는 것이 목표는 아닙니다. 끝까지 만들어 보고, 배포하고,
            사람들이 사용하는 서비스를 운영해 보는 것이 목표입니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--text-dim)]/70">
              {closed ? "모집 마감" : `마감까지 ${remaining}일`}
            </span>
            <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--text-dim)]/70">
              시작 {site.startsAt}
            </span>
            <span className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[var(--text-dim)]/70">
              {site.duration}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* 지원 전에 절차를 먼저 보여준다. 얼마나 걸리는지 모르는 게 지원을 망설이게 한다. */}
      <FadeIn delay={0.1}>
        <ol className="mx-auto mb-16 grid max-w-3xl gap-4 sm:grid-cols-3">
          {site.recruitingSteps.map((s) => (
            <li
              key={s.step}
              className="relative z-10 rounded-[20px] border border-[var(--line)] bg-white/[0.03] p-5"
            >
              <span className="font-display text-xs tracking-widest text-[var(--muted)]">
                {s.step}
              </span>
              <h3 className="mt-2 text-sm font-medium text-white">{s.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-dim)]/60">{s.desc}</p>
            </li>
          ))}
        </ol>
      </FadeIn>

      {closed ? (
        <p className="mx-auto max-w-xl rounded-[28px] border border-[var(--line)] bg-white/[0.03] px-6 py-10 text-center text-[var(--text-dim)]/80">
          모집이 마감되었습니다. 관심 가져주셔서 감사합니다.
        </p>
      ) : openPositions.length === 0 ? (
        <p className="mx-auto max-w-xl rounded-[28px] border border-[var(--line)] bg-white/[0.03] px-6 py-10 text-center text-[var(--text-dim)]/80">
          현재 모든 포지션의 모집이 완료되었습니다.
        </p>
      ) : (
        <ApplyForm />
      )}

      {/* 지원서를 쓰다 막히는 순간 바로 물어볼 수 있게 폼 바로 아래에 둔다. */}
      <div className="relative z-10 mt-20 pt-14">
        <QnaPreview />

        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm text-white">
            지원 전에 궁금한 점이 있으신가요?
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            게시판에 남기시면 답변해 드립니다. 다른 분들의 질문과 답변도 함께 볼 수 있습니다.
          </p>
          <Link href="/qna" className="btn-ghost mt-5 inline-block px-7 py-3 text-xs">
            문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
