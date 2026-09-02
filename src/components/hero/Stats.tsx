"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export interface Stat {
  glyph: string;
  value: number;
  suffix: string;
  decimals: number;
  label: string;
  /**
   * 숫자 대신 순서대로 돌아가며 보여줄 값들.
   * 파트 이름처럼 "몇 개"보다 "무엇"이 중요한 항목에 쓴다.
   */
  values?: string[];
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function useCountUp(target: number, index: number, active: boolean) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active || reduced) return;

    const duration = 1500 + index * 80;
    const startDelay = 480 + index * 90;
    let raf = 0;
    let t0 = 0;

    const timer = window.setTimeout(() => {
      const step = (t: number) => {
        if (!t0) t0 = t;
        const p = Math.min(1, (t - t0) / duration);
        setN(target * easeOutCubic(p));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, index, active, reduced]);

  return reduced ? target : n;
}

/**
 * 값들을 타자기처럼 한 글자씩 쳤다 지우며 순서대로 보여준다.
 *
 *   빈 화면(커서 깜빡임) → 한 글자씩 입력 → 잠시 유지 → 한 글자씩 삭제 → 다음 값
 *
 * 각 단계가 끝날 때마다 다음 단계를 예약하는 방식이라, 단계별로 다른 속도를 줄 수 있다.
 * 지우는 속도는 치는 속도보다 빨라야 자연스럽다.
 */
const TYPE_MS = 85;
const DELETE_MS = 45;
const HOLD_MS = 1700;
const BLANK_MS = 420;

function useTypewriter(values: string[] | undefined, active: boolean) {
  const reduced = usePrefersReducedMotion();
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!values?.length || !active || reduced) return;

    const word = values[wordIndex % values.length];
    const done = !deleting && text === word;
    const emptied = deleting && text === "";

    const delay = done ? HOLD_MS : emptied ? BLANK_MS : deleting ? DELETE_MS : TYPE_MS;

    const id = window.setTimeout(() => {
      if (done) {
        setDeleting(true);
      } else if (emptied) {
        setDeleting(false);
        setWordIndex((i) => i + 1);
      } else {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [values, active, reduced, text, deleting, wordIndex]);

  if (!values?.length) return null;
  // 모션을 줄인 환경에서는 첫 값을 그대로 보여준다.
  if (reduced) return { typed: values[0], word: values[0] };
  // word(지금 치고 있는 단어 전체)는 글자가 늘어도 자리가 안 밀리도록
  // 폭을 미리 잡는 데 쓴다.
  return { typed: text, word: values[wordIndex % values.length] };
}

function StatItem({ stat, index, active }: { stat: Stat; index: number; active: boolean }) {
  const n = useCountUp(stat.value, index, active);
  const tw = useTypewriter(stat.values, active);

  return (
    <div
      className="anim-reveal flex flex-col items-center gap-1.5"
      style={{ ["--d" as string]: `${0.5 + index * 0.08}s` }}
    >
      <span
        aria-hidden
        className="font-display leading-none text-white/90"
        style={{ fontSize: "clamp(22px, 3vw, 33px)" }}
      >
        {stat.glyph}
      </span>
      <span
        className="tabular font-medium text-white"
        style={{ fontSize: "clamp(18px, 2.2vw, 26px)", letterSpacing: "-0.025em" }}
      >
        {tw !== null ? (
          // 상자를 두 겹으로 둔다.
          // 바깥: 가장 긴 값으로 열 폭을 고정한다. 단어가 바뀌어도 옆 지표가 밀리지 않는다.
          // 안쪽: 지금 단어 폭만큼만 잡고 왼쪽 정렬한다. 글자가 늘어도 이미 쓴 글자가
          //       밀리지 않는다. 이 상자 자체가 바깥에서 가운데 놓이므로 단어는
          //       글자 수와 무관하게 중앙에 온다.
          <span className="relative inline-grid justify-items-center">
            <span
              aria-hidden
              className="invisible col-start-1 row-start-1 select-none whitespace-pre"
            >
              {stat.values?.reduce((a, b) => (b.length > a.length ? b : a), "")}|
            </span>
            <span className="relative col-start-1 row-start-1 inline-grid justify-items-start">
              <span
                aria-hidden
                className="invisible col-start-1 row-start-1 select-none whitespace-pre"
              >
                {tw.word}|
              </span>
              <span className="col-start-1 row-start-1 whitespace-pre">
                {tw.typed}
                <span aria-hidden className="anim-caret font-normal text-white/70">
                  |
                </span>
              </span>
            </span>
          </span>
        ) : (
          <>
            {n.toFixed(stat.decimals)}
            {stat.suffix}
          </>
        )}
      </span>
      <span
        className="text-[var(--muted)]"
        style={{ fontSize: "clamp(11px, 1.2vw, 12.5px)" }}
      >
        {stat.label}
      </span>
    </div>
  );
}

export default function Stats({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto grid w-full max-w-[920px] grid-cols-2 gap-y-8 md:grid-cols-4"
    >
      {stats.map((s, i) => (
        <StatItem key={s.label} stat={s} index={i} active={active} />
      ))}
    </div>
  );
}
