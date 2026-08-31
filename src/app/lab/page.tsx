"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useState } from "react";
import DotMatrixHeadline from "@/components/hero/DotMatrixHeadline";
import GlyphField from "@/components/hero/GlyphField";
import LiveStats from "@/components/hero/LiveStats";
import MeshBackdrop from "@/components/hero/MeshBackdrop";
import { daysLeft, positions, site } from "@/config/site";

/**
 * 히어로 배경 실험실.
 *
 * 실서비스 히어로는 건드리지 않고, 여기서 배경만 갈아끼우며 비교한다.
 * 글리프 텍스처·도트 헤드라인·스탯 등 나머지 요소는 실제와 동일하게 얹어
 * 배경이 바뀌었을 때 전체가 어떻게 보이는지 그대로 판단할 수 있게 했다.
 */

/** 레퍼런스에서 뽑은 팔레트. 후보 전체가 같은 색을 쓴다. */
const PALETTE = ["#a8a6c1", "#c6c4d4", "#cac7d2", "#efcadd", "#e1b5ac", "#db898b", "#ae6a61"];

/** 하단을 --bg와 같은 검정으로 떨어뜨려 다음 섹션과 이음매를 없앤다. */
function BottomFade() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[34vh]"
      style={{
        background: "linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.7) 52%, #0c0c0c 92%)",
      }}
    />
  );
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Grain({ opacity = 0.3 }: { opacity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      style={{ backgroundImage: GRAIN, backgroundRepeat: "repeat", mixBlendMode: "overlay", opacity }}
    />
  );
}

type Variant = { id: string; label: string; note: string; backdrop: React.ReactNode };

const VARIANTS: Variant[] = [
  {
    id: "now",
    label: "현재",
    note: "지금 라이브에 올라간 배경",
    backdrop: <MeshBackdrop />,
  },
  {
    id: "A",
    label: "A · wave",
    note: "GrainGradient wave — 물결치는 경계",
    backdrop: (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          colorBack="#0c0c0c"
          colors={PALETTE}
          shape="wave"
          softness={0.78}
          intensity={0.42}
          noise={0.38}
          speed={0.32}
        />
        <Grain />
        <BottomFade />
      </div>
    ),
  },
  {
    id: "C",
    label: "C · ripple",
    note: "GrainGradient ripple — 가운데 어두운 렌즈",
    backdrop: (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          colorBack="#0c0c0c"
          colors={PALETTE}
          shape="ripple"
          softness={0.82}
          intensity={0.4}
          noise={0.38}
          speed={0.26}
        />
        <Grain />
        <BottomFade />
      </div>
    ),
  },
  {
    id: "AC",
    label: "A+C 겹침",
    note: "wave 위에 ripple을 얹어 파도 2겹을 만든다",
    backdrop: (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          colorBack="#0c0c0c"
          colors={PALETTE}
          shape="wave"
          softness={0.78}
          intensity={0.45}
          noise={0.36}
          speed={0.32}
        />
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          colorBack="#0c0c0c"
          colors={PALETTE}
          shape="ripple"
          softness={0.85}
          intensity={0.35}
          noise={0.3}
          speed={0.2}
          style={{ mixBlendMode: "screen", opacity: 0.55 }}
        />
        <Grain />
        <BottomFade />
      </div>
    ),
  },
  {
    id: "A-soft",
    label: "A · 부드럽게",
    note: "wave에서 대비를 낮추고 그레인을 키운 버전",
    backdrop: (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
        <GrainGradient
          className="absolute inset-0 h-full w-full"
          colorBack="#0c0c0c"
          colors={PALETTE}
          shape="wave"
          softness={0.92}
          intensity={0.3}
          noise={0.55}
          speed={0.22}
        />
        <Grain opacity={0.45} />
        <BottomFade />
      </div>
    ),
  },
];

export default function LabPage() {
  const [active, setActive] = useState("A");
  const current = VARIANTS.find((v) => v.id === active) ?? VARIANTS[0];

  return (
    <main className="bg-[#0c0c0c]">
      {/* 배경만 바꿔가며 보는 스위처 */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur">
        {VARIANTS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(v.id)}
            className={`rounded-full px-4 py-2 text-xs transition ${
              v.id === active ? "bg-white text-black" : "border border-white/25 text-white/70 hover:text-white"
            }`}
          >
            {v.label}
          </button>
        ))}
        <span className="ml-2 text-xs text-white/45">{current.note}</span>
      </div>

      {/* 실제 히어로와 같은 구성 */}
      <section
        className="relative flex min-h-[100svh] flex-col overflow-hidden"
        style={{ minHeight: "100dvh" }}
      >
        {current.backdrop}
        <GlyphField />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
          <h1 className="w-full max-w-[1020px]">
            <DotMatrixHeadline lines={[...site.headline]} />
          </h1>

          <p className="mt-5 max-w-[min(560px,92%)] whitespace-pre-line text-[clamp(0.9rem,1.6vw,1.05rem)] leading-[1.65] text-white/85">
            {site.subhead}
          </p>

          <span className="btn-cta mt-8 inline-block px-8 py-3.5 text-xs sm:px-10 sm:text-sm">
            지원하기
          </span>
        </div>

        <div className="relative z-10 w-full shrink-0 px-5 pb-8 md:pb-12">
          <LiveStats remaining={daysLeft()} partCount={positions.length} months={3} />
        </div>
      </section>

      <div className="px-4 py-10 text-center text-sm text-white/40">
        아래는 실제 사이트의 다음 섹션이 이어지는 자리입니다 — 하단이 #0C0C0C로 떨어지는지 확인용
      </div>
    </main>
  );
}
