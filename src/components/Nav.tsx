"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#about", label: "소개" },
  { href: "#positions", label: "포지션" },
  { href: "#process", label: "프로세스" },
  { href: "#apply", label: "지원" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 720) setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="anim-nav relative z-20 w-full px-4 pt-5 sm:px-6 md:px-10 md:pt-8">
      <div className="mx-auto flex max-w-[760px] items-center gap-4 md:gap-7">
        {/* 로고 */}
        <a
          href="#top"
          aria-label="맨 위로"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-transform hover:scale-[1.04] md:h-[46px] md:w-[46px]"
        >
          <span className="font-display text-[15px] leading-none font-bold text-[#0c0c0c]">
            0
          </span>
        </a>

        {/* 데스크톱 nav */}
        <nav className="hidden h-11 flex-1 items-center justify-between rounded-full bg-white px-3 shadow-[0_4px_14px_rgba(0,0,0,0.16)] md:flex md:h-12 md:max-w-[430px] md:px-2">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-[13px] font-medium tracking-[-0.01em] text-[#2e2e2e] opacity-50 transition-opacity hover:opacity-75 md:text-[15px]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* 데스크톱 CTA */}
        <a
          href="#apply"
          className="hidden h-11 shrink-0 items-center rounded-full bg-[#28282a] px-5 text-[13px] font-medium text-[#c8c8c8] shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition hover:-translate-y-px hover:bg-[#323234] hover:text-white md:flex md:h-12 md:text-[15px]"
        >
          지원하기
        </a>

        {/* 모바일 버거 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors md:hidden ${
            open ? "bg-white" : "bg-[#28282a]"
          }`}
        >
          <span className="relative block h-[14px] w-[18px]">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`absolute left-0 block h-[1.5px] w-[18px] rounded transition-all duration-300 ${
                  open ? "bg-[#0c0c0c]" : "bg-white"
                }`}
                style={
                  open
                    ? {
                        top: "6px",
                        transform:
                          i === 1 ? "scaleX(0)" : `rotate(${i === 0 ? 45 : -45}deg)`,
                        opacity: i === 1 ? 0 : 1,
                      }
                    : { top: `${i * 6}px` }
                }
              />
            ))}
          </span>
        </button>
      </div>

      {/* 모바일 시트 */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[6px] md:hidden"
            aria-hidden
          />
          <div
            id="mobile-menu"
            className="absolute inset-x-4 top-[76px] z-40 rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l, i) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="anim-reveal block px-2 py-3 text-[17px] font-medium text-[#2e2e2e]"
                    style={{ ["--d" as string]: `${0.04 * i}s` }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#apply"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-full bg-[#0c0c0c] py-3.5 text-center text-[15px] font-medium text-white"
            >
              지원하기
            </a>
          </div>
        </>
      )}
    </header>
  );
}
