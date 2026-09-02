"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import SectionDecor, { type DecorItem } from "@/components/decor/SectionDecor";
import { PixelArc, PixelWave } from "@/components/decor/PixelOrnaments";
import { site } from "@/config/site";

interface Card {
  no: string;
  title: string;
  caption: string;
  body: React.ReactNode;
}

function StackCard({
  card,
  index,
  total,
  progress,
}: {
  card: Card;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div className="sticky top-24 h-[85vh] md:top-32">
      <motion.article
        style={{ scale, top: `${index * 28}px` }}
        className="relative flex h-full flex-col rounded-[40px] border-2 border-[#d7e2ea] bg-[#0c0c0c] p-5 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-baseline gap-4 md:gap-6">
            <span className="item-no font-display text-[#d7e2ea]">{card.no}</span>
            <div>
              <p className="font-display text-xs tracking-widest text-[#d7e2ea]/45 uppercase">
                {card.caption}
              </p>
              <h3 className="item-name mt-1 font-medium text-white uppercase">{card.title}</h3>
            </div>
          </div>
        </header>

        <div className="mt-6 min-h-0 flex-1 overflow-hidden md:mt-8">{card.body}</div>
      </motion.article>
    </div>
  );
}

const ORNAMENTS: DecorItem[] = [
  {
    Shape: PixelWave,
    position: "top-[8%] left-[3%] md:left-[5%]",
    size: "w-[130px] md:w-[200px]",
    delay: 0.1,
    from: "left",
  },
  {
    Shape: PixelArc,
    position: "bottom-[6%] right-[3%] md:right-[5%]",
    size: "w-[140px] md:w-[210px]",
    delay: 0.22,
    from: "right",
  },
];

export default function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const cards: Card[] = [
    {
      no: "01",
      caption: "How we work",
      title: "개발 프로세스",
      body: (
        <ol className="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {site.process.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-4 border-b border-[var(--line)] py-2.5"
            >
              <span className="font-display w-8 shrink-0 text-sm text-[#d7e2ea]/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[clamp(0.85rem,1.5vw,1rem)] text-[var(--text-dim)]">
                {step}
              </span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      no: "02",
      caption: "Timeline",
      title: "프로젝트 일정",
      body: (
        <dl className="grid gap-6 sm:grid-cols-2">
          {[
            { k: "예상 시작일", v: site.startsAt },
            { k: "예상 개발 기간", v: site.duration },
            { k: "정기 회의", v: `${site.meeting} · Discord 온라인 중심` },
            { k: "진행 방식", v: "온라인 중심 · 필요 시 오프라인" },
          ].map((row) => (
            <div key={row.k} className="border-t border-[var(--line)] pt-4">
              <dt className="font-display text-xs tracking-widest text-[#d7e2ea]/45 uppercase">
                {row.k}
              </dt>
              <dd className="mt-2 text-[clamp(1rem,2vw,1.35rem)] text-white">{row.v}</dd>
            </div>
          ))}
          <p className="body-copy sm:col-span-2 text-[var(--text-dim)]/60">
            3개월 내 배포를 목표로 하되, 배포 이후에도 팀원들과 협의하여 서비스 개선과 운영을
            이어갑니다. 지나치게 타이트한 일정보다 각자의 본업과 개인 일정을 존중하면서 꾸준히
            참여할 수 있는 방식으로 운영합니다.
          </p>
        </dl>
      ),
    },
    {
      no: "03",
      caption: "What you get",
      title: "얻어갈 수 있는 것",
      body: (
        <ul className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
          {site.gains.map((g) => (
            <li
              key={g}
              className="flex gap-3 border-b border-[var(--line)] py-3 text-[clamp(0.85rem,1.5vw,1rem)] text-[var(--text-dim)]"
            >
              <span aria-hidden className="font-display text-[#d7e2ea]/35">
                +
              </span>
              {g}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <section
      id="process"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0c0c0c] px-5 pt-20 pb-32 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10"
    >
      <SectionDecor items={ORNAMENTS} opacity="opacity-45" />

      <h2 className="section-heading grad-heading font-display relative z-10 text-center">
        Process
      </h2>

      <div ref={ref} className="mx-auto mt-16 max-w-5xl">
        {cards.map((c, i) => (
          <StackCard
            key={c.no}
            card={c}
            index={i}
            total={cards.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
