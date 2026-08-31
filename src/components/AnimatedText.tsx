"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * 문자단위 스크롤 리빌.
 *
 * 한글 문단에 남발하면 글자마다 DOM 노드가 생겨 성능이 무너지고
 * 스크린리더가 한 글자씩 읽는다. 그래서 About 한 문단에만 쓴다.
 * 원문은 sr-only로 따로 제공하고 애니메이션 레이어는 aria-hidden 처리한다.
 */
export default function AnimatedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.2"],
  });

  const chars = Array.from(text);

  return (
    <>
      <span className="sr-only">{text}</span>
      <p ref={ref} aria-hidden className={className}>
        {chars.map((ch, i) => (
          <Char key={i} progress={scrollYProgress} index={i} total={chars.length}>
            {ch}
          </Char>
        ))}
      </p>
    </>
  );
}

function Char({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  index: number;
  total: number;
}) {
  // 글자 하나가 또렷해지는 구간을 앞뒤로 겹쳐 두면
  // 딱딱 끊기지 않고 물결처럼 이어진다.
  const at = index / total;
  const start = Math.max(0, at - 0.1);
  const end = Math.min(1, at + 0.05);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  const glyph = children === " " ? " " : children;

  return (
    <span className="relative inline-block">
      {/* 자리만 차지하는 사본. 위에 얹히는 글자가 absolute라 폭이 무너지지 않게 한다. */}
      <span className="opacity-0">{glyph}</span>
      <motion.span style={{ opacity }} className="absolute top-0 left-0">
        {glyph}
      </motion.span>
    </span>
  );
}
