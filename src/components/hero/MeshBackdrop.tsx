"use client";

import { GrainGradient } from "@paper-design/shaders-react";

/**
 * 히어로 배경.
 *
 * 라디얼 그라디언트나 손으로 그린 곡선으로는 레퍼런스의 물결치는 경계가 나오지 않았다.
 * Paper Shaders의 GrainGradient는 `wave` 셰이프와 그레인을 함께 제공해,
 * 레퍼런스와 같은 구성(물결 경계 + 거친 질감 + 다색 그라디언트)을 그대로 만든다.
 *
 * 색은 레퍼런스에서 뽑은 팔레트를 **그대로** 쓴다. 단색으로 줄이면 전혀 다른 인상이 된다.
 */
const PALETTE = ["#a8a6c1", "#c6c4d4", "#cac7d2", "#efcadd", "#e1b5ac", "#db898b", "#ae6a61"];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function MeshBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <GrainGradient
        className="absolute inset-0 h-full w-full"
        colorBack="#0c0c0c"
        colors={PALETTE}
        shape="wave"
        softness={0.78}
        intensity={0.42}
        noise={0.38}
        speed={0.55}
      />

      {/*
        헤드라인·서브헤드·CTA가 밝은 파도 마루에 걸치면 흰 글씨가 묻힌다.
        파도 모양은 매 순간 달라지므로, 글이 놓이는 세로 구간을 통째로 눌러
        어느 위상에서도 읽히게 한다.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 34% at 50% 48%, rgba(16,9,11,0.72) 0%, rgba(16,9,11,0.5) 45%, rgba(16,9,11,0.16) 75%, rgba(16,9,11,0) 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
          opacity: 0.3,
        }}
      />

      {/* 하단을 --bg와 같은 검정으로 떨어뜨려 다음 섹션과 무이음 연결 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[34vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.7) 52%, #0c0c0c 92%)",
        }}
      />
    </div>
  );
}
