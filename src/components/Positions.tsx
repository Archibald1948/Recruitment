import FadeIn from "@/components/ui/FadeIn";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import { PixelDiamond, PixelGrid } from "@/components/decor/PixelOrnaments";
import PositionApplyButton from "@/components/PositionApplyButton";
import { positions, site } from "@/config/site";

const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelGrid,
    position: "top-[6%] left-[2%] md:left-[5%]",
    size: "w-[110px] md:w-[170px]",
    delay: 0.12,
    from: "left",
  },
  {
    Shape: PixelDiamond,
    position: "bottom-[5%] right-[2%] md:right-[5%]",
    size: "w-[120px] md:w-[190px]",
    delay: 0.24,
    from: "right",
  },
];

export default function Positions() {
  return (
    <section
      id="positions"
      className="relative z-0 overflow-hidden rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <SectionDecor items={ORNAMENTS} tone="ink" opacity="opacity-25" />

      <FadeIn>
        <h2 className="section-heading font-display relative z-10 text-center text-[#0c0c0c]">
          Positions
        </h2>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-5">
          <p className="text-center text-sm leading-relaxed text-[#0c0c0c]/65">
            개발 실력이 가장 뛰어난 사람보다, 끝까지 함께하며 적극적으로 참여할 수 있는 분을
            찾고 있습니다. 현재 실력이 완벽하지 않아도 괜찮습니다.
          </p>
          <span className="rounded-full border border-[var(--line-ink)] px-4 py-2 text-xs text-[#0c0c0c]/70">
            {site.stage}
          </span>
        </div>
      </FadeIn>

      <div className="mx-auto mt-16 max-w-5xl sm:mt-20 md:mt-24">
        {positions.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.1}>
            <article
              className={`flex flex-col gap-4 border-t border-[var(--line-ink)] py-8 sm:flex-row sm:gap-8 sm:py-10 md:py-12 ${
                p.open ? "" : "opacity-45"
              } ${i === positions.length - 1 ? "border-b" : ""}`}
            >
              <div className="item-no font-display shrink-0 text-[#0c0c0c] sm:w-[22%]">
                {p.no}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="item-name font-medium text-[#0c0c0c] uppercase">{p.title}</h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      p.open
                        ? "bg-[#0c0c0c] text-white"
                        : "border border-[var(--line-ink)] text-[#0c0c0c]/70"
                    }`}
                  >
                    {p.open ? `모집 중 · ${p.headcount}` : p.headcount}
                  </span>
                  {p.note && (
                    <span className="rounded-full border border-[var(--line-ink)] px-3 py-1 text-xs text-[#0c0c0c]/60">
                      {p.note}
                    </span>
                  )}
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

                {p.open && (
                  <PositionApplyButton
                    positionId={p.id}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0c0c0c] px-6 py-3 text-xs font-medium tracking-widest text-white uppercase transition hover:-translate-y-px"
                  />
                )}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
