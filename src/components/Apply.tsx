import ApplyForm from "@/components/ApplyForm";
import FadeIn from "@/components/ui/FadeIn";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import { PixelOrbit, PixelSphere } from "@/components/decor/PixelOrnaments";
import { daysLeft, isClosed, openPositions, site } from "@/config/site";

const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelSphere,
    position: "top-[10%] left-[2%] md:left-[6%]",
    size: "w-[110px] md:w-[170px]",
    delay: 0.1,
    from: "left",
  },
  {
    Shape: PixelOrbit,
    position: "bottom-[8%] right-[2%] md:right-[6%]",
    size: "w-[120px] md:w-[180px]",
    delay: 0.24,
    from: "right",
  },
];

export default function Apply() {
  const closed = isClosed();
  const remaining = daysLeft();

  return (
    <section id="apply" className="relative overflow-hidden bg-[#0c0c0c] px-5 py-24 sm:px-8 md:px-10 md:py-32">
      <SectionDecor items={ORNAMENTS} opacity="opacity-40" />

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
    </section>
  );
}
