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

/** 값들을 순서대로 돌려가며 보여준다. */
function useRotation(values: string[] | undefined, active: boolean) {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!values || values.length < 2 || !active || reduced) return;
    const id = window.setInterval(() => {
      setI((prev) => (prev + 1) % values.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [values, active, reduced]);

  return values ? values[i % values.length] : null;
}

function StatItem({ stat, index, active }: { stat: Stat; index: number; active: boolean }) {
  const n = useCountUp(stat.value, index, active);
  const rotating = useRotation(stat.values, active);

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
        {rotating !== null ? (
          // 글자 수가 달라도 자리가 흔들리지 않도록 가장 긴 값으로 폭을 잡는다.
          <span className="relative inline-grid place-items-center">
            <span aria-hidden className="invisible col-start-1 row-start-1">
              {stat.values?.reduce((a, b) => (b.length > a.length ? b : a), "")}
            </span>
            <span key={rotating} className="anim-rotate col-start-1 row-start-1">
              {rotating}
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
