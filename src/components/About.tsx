import FadeIn from "@/components/ui/FadeIn";
import AnimatedText from "@/components/AnimatedText";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import {
  PixelBlocks,
  PixelMoon,
  PixelOrbit,
  PixelSphere,
} from "@/components/decor/PixelOrnaments";

const LEAD_INTRO =
  "10번 이상의 프로젝트, 3곳의 대학생 개발 연합동아리, 7회 이상의 대회·공모전. 백엔드부터 프론트엔드, 모바일까지 풀스택으로 참여해 왔고, 웹 서비스를 1인 개발해 베타 테스트까지 운영해 봤습니다. 이번에도 특정 파트에만 머무르지 않고 서비스 전체 구조와 파트 간 연결을 함께 고민하려 합니다.";

const STACKS = [
  {
    title: "Back-End",
    items: ["Spring Boot", "FastAPI", "Django", "Node.js", "PostgreSQL", "MySQL", "REST API 설계"],
  },
  { title: "Front-End", items: ["JavaScript", "TypeScript", "React"] },
  { title: "Mobile", items: ["Xcode", "SwiftUI", "UIKit"] },
  { title: "Deploy", items: ["Render", "Cloudflare Pages", "Netlify"] },
];

/** 코너를 채우는 장식 오브젝트 */
const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelMoon,
    position: "top-[4%]",
    max: 210,
    delay: 0.1,
    from: "left",
  },
  {
    Shape: PixelOrbit,
    position: "bottom-[8%]",
    max: 180,
    offset: 28,
    delay: 0.25,
    from: "left",
  },
  {
    Shape: PixelBlocks,
    position: "top-[4%]",
    max: 210,
    delay: 0.15,
    from: "right",
  },
  {
    Shape: PixelSphere,
    position: "bottom-[8%]",
    max: 220,
    offset: 20,
    delay: 0.3,
    from: "right",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10"
    >
      <SectionDecor items={ORNAMENTS} content={896} opacity="opacity-70" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-16 sm:gap-20 md:gap-24">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
          <FadeIn y={40}>
            <h2 className="section-heading grad-heading font-display text-center">About</h2>
          </FadeIn>

          <AnimatedText
            text={LEAD_INTRO}
            className="body-copy max-w-[620px] text-center font-medium text-[var(--text-dim)]"
          />
        </div>

        <div className="grid w-full grid-cols-2 gap-x-5 gap-y-8 sm:gap-8 lg:grid-cols-4">
          {STACKS.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.1}>
              <div className="border-t border-[var(--line)] pt-5">
                <h3 className="font-display text-sm tracking-wider text-white uppercase">
                  {s.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm text-[var(--text-dim)]/70">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="flex flex-col items-center gap-10 sm:gap-12">
          <FadeIn delay={0.2}>
            <p className="body-copy max-w-[620px] text-center text-[var(--text-dim)]/70">
              팀장이라고 해서 방향을 일방적으로 정하지 않습니다. 각 파트의 의견을 충분히 듣고
              함께 결정합니다. 프로젝트 하나를 끝내는 데서 그치지 않고, 각자가 한 단계 성장할 수
              있는 프로젝트가 되도록 만들어 가겠습니다.
              <br />
              <br />
              <strong className="font-medium text-white">
                하나의 서비스를 만들고 끝나는 팀이 아니라, 새로운 아이디어를 계속 발굴하고 또
                다른 서비스를 만들어낼 수 있는 지속 가능한 팀을 지향합니다.
              </strong>
            </p>
          </FadeIn>

          <FadeIn delay={0.3} y={20}>
            <a
              href="#positions"
              className="btn-cta inline-block px-8 py-3 text-xs sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
            >
              모집 포지션 보기
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
