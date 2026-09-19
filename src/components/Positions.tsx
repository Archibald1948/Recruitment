import FadeIn from "@/components/ui/FadeIn";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import { PixelDiamond, PixelGrid } from "@/components/decor/PixelOrnaments";
import PositionApplyButton from "@/components/PositionApplyButton";
import { positions } from "@/config/site";

const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelGrid,
    position: "top-[6%]",
    max: 170,
    delay: 0.12,
    from: "left",
  },
  {
    Shape: PixelDiamond,
    position: "bottom-[5%]",
    max: 190,
    delay: 0.24,
    from: "right",
  },
];

export default function Positions() {
  return (
    <section
      id="positions"
      className="relative z-10 overflow-hidden rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <SectionDecor items={ORNAMENTS} content={1024} tone="ink" opacity="opacity-25" />

      <FadeIn>
        <h2 className="section-heading font-display relative z-10 text-center text-[#0c0c0c]">
          Positions
        </h2>
      </FadeIn>

      <FadeIn delay={0.05}>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-[#0c0c0c]/65">
          가장 뛰어난 사람보다, 끝까지 함께하며 적극적으로 참여할 수 있는 분을 찾고
          있습니다. 지금 실력이 완벽하지 않아도 괜찮습니다.
        </p>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-5xl sm:mt-20 md:mt-24">
        {positions.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.1}>
            <article
              // 마감 포지션은 번호·이름만 흐리게 한다. 카드 전체를 흐리게 하면
              // 본문 대비가 규칙(디자인 시스템 §8) 아래로 떨어져 읽을 수 없게 된다.
              className={`flex flex-col gap-4 border-t border-[var(--line-ink)] py-8 sm:flex-row sm:gap-8 sm:py-10 md:py-12 ${
                i === positions.length - 1 ? "border-b" : ""
              }`}
              aria-label={p.open ? undefined : `${p.title} — 모집 마감`}
            >
              <div
                className={`item-no font-display shrink-0 sm:w-[22%] ${
                  p.open ? "text-[#0c0c0c]" : "text-[#0c0c0c]/35"
                }`}
              >
                {p.no}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3
                    className={`item-name font-medium uppercase ${
                      p.open ? "text-[#0c0c0c]" : "text-[#0c0c0c]/45"
                    }`}
                  >
                    {p.title}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p.open
                        ? "bg-[#0c0c0c] text-white"
                        : "border border-[var(--line-ink)] text-[#0c0c0c]/70"
                    }`}
                  >
                    {p.open ? `모집 중 · ${p.headcount}` : "모집 마감"}
                  </span>
                </div>

                <p className="mt-3 max-w-2xl text-[clamp(0.85rem,1.6vw,1.05rem)] leading-relaxed font-light text-[#0c0c0c]/70">
                  {p.summary}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.points.map((pt) => (
                    <li
                      key={pt}
                      className="rounded-full border border-[var(--line-ink)] px-3 py-1.5 text-xs text-[#0c0c0c]/65"
                    >
                      {pt}
                    </li>
                  ))}
                </ul>

                <ul className="mt-5 flex flex-col gap-1.5">
                  {p.wants.map((w) => (
                    <li
                      key={w}
                      className="flex gap-2 text-sm leading-relaxed text-[#0c0c0c]/65"
                    >
                      <span aria-hidden className="font-display text-[#0c0c0c]/35">
                        &gt;
                      </span>
                      {w}
                    </li>
                  ))}
                </ul>

                {p.open ? (
                  <PositionApplyButton
                    positionId={p.id}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0c0c0c] px-6 py-3 text-xs font-medium tracking-widest text-white uppercase transition hover:-translate-y-px"
                  />
                ) : (
                  /*
                   * 버튼만 빼면 "왜 여기만 지원 버튼이 없지"로 읽힌다.
                   * 자리를 비우지 말고 마감이라고 적어 준다.
                   */
                  <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--line-ink)] px-6 py-3 text-xs text-[#0c0c0c]/60">
                    모집이 마감되어 지원을 받지 않습니다
                  </p>
                )}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
