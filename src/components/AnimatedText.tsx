"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { Fragment, useMemo, useRef } from "react";

/**
 * 문자단위 스크롤 리빌.
 *
 * 글자를 하나씩 span으로 쪼개면 브라우저가 **어절 중간에서도 줄을 바꿔버린다.**
 * ("머무 / 르지" 같은 끊김) 그래서 어절 단위로 한 겹 감싸고, 그 안에서만 글자를 쪼갠다.
 *
 * 한글 문단에 남발하면 DOM이 폭증하고 스크린리더가 한 글자씩 읽으므로
 * About 한 문단에만 쓴다. 원문은 sr-only로 따로 제공한다.
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

  // 어절로 나누되, 전체 글자 순번은 유지해야 리빌이 왼쪽에서 오른쪽으로 흐른다.
  const { words, total } = useMemo(() => {
    const chunks = text.split(" ");
    // 각 어절의 시작 순번을 미리 구한다. 공백도 한 칸으로 센다.
    const offsets = chunks.reduce<number[]>(
      (acc, word, i) => [...acc, acc[i] + Array.from(word).length + 1],
      [0],
    );
    const words = chunks.map((word, i) =>
      Array.from(word).map((ch, j) => ({ ch, index: offsets[i] + j })),
    );
    return { words, total: offsets[chunks.length] };
  }, [text]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <p ref={ref} aria-hidden className={className}>
        {words.map((chars, w) => (
          <Fragment key={w}>
            <span className="inline-block whitespace-nowrap">
              {chars.map(({ ch, index }) => (
                <Char key={index} progress={scrollYProgress} index={index} total={total}>
                  {ch}
                </Char>
              ))}
            </span>
            {/*
              공백은 어절 span **밖에** 둬야 한다. 안에 넣으면 inline-block의
              후행 공백으로 취급돼 잘려나가 단어가 전부 붙어버린다.
              여기 두면 줄바꿈 지점 역할도 한다.
            */}
            {w < words.length - 1 && <span> </span>}
          </Fragment>
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
  // 글자가 또렷해지는 구간을 앞뒤로 겹쳐 두면 딱딱 끊기지 않고 물결처럼 이어진다.
  const at = index / total;
  const start = Math.max(0, at - 0.1);
  const end = Math.min(1, at + 0.05);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  return (
    <span className="relative inline-block">
      {/* 자리만 차지하는 사본. 위에 얹히는 글자가 absolute라 폭이 무너지지 않게 한다. */}
      <span className="opacity-0">{children}</span>
      <motion.span style={{ opacity }} className="absolute top-0 left-0">
        {children}
      </motion.span>
    </span>
  );
}
