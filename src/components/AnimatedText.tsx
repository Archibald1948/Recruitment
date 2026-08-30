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
          <Char key={i} progress={scrollYProgress} range={[i / chars.length, (i + 1) / chars.length]}>
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
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  if (children === "\n") return <br />;
  return (
    <motion.span style={{ opacity }}>
      {children === " " ? " " : children}
    </motion.span>
  );
}
