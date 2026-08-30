"use client";

import { useEffect, useRef, useState } from "react";

function Row({ items, offset, reverse }: { items: string[]; offset: number; reverse: boolean }) {
  const tripled = [...items, ...items, ...items];
  const x = reverse ? -(offset - 200) : offset - 200;

  return (
    <div className="flex gap-3 will-change-transform" style={{ transform: `translateX(${x}px)` }}>
      {tripled.map((label, i) => (
        <span
          key={`${label}-${i}`}
          className="shrink-0 rounded-2xl border border-[var(--line)] bg-white/[0.03] px-6 py-4 text-[clamp(0.85rem,1.5vw,1.05rem)] whitespace-nowrap text-[var(--text-dim)]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function Marquee({ top, bottom }: { top: string[]; bottom: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      ref={ref}
      aria-label="협업 도구와 기술 스택"
      className="relative -mt-px overflow-hidden bg-[#0c0c0c] pt-20 pb-10 sm:pt-28 md:pt-36"
    >
      <div className="flex flex-col gap-3">
        <Row items={top} offset={offset} reverse={false} />
        <Row items={bottom} offset={offset} reverse />
      </div>

      {/* 양 끝 페이드 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0c0c0c] to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0c0c0c] to-transparent md:w-32" />
    </section>
  );
}
