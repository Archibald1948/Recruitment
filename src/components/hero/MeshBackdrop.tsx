"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * 히어로 배경 웨이브.
 *
 * 팔레트 마지막 색은 반드시 --bg(#0C0C0C)와 같아야 한다.
 * 그래야 하단 페이드와 다음 섹션 사이에 이음매가 보이지 않는다.
 */
const PALETTE = ["#e9dff0", "#c07fd0", "#8f2f86", "#3d1250", "#0c0c0c", "#0c0c0c"];

export default function MeshBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={PALETTE}
        distortion={0.85}
        swirl={0.55}
        grainMixer={0.12}
        grainOverlay={0.05}
        speed={reduced ? 0 : 0.18}
        frame={reduced ? 12_000 : undefined}
      />

      {/*
        MeshGradient는 색을 유기적으로 흩뿌리기 때문에 그 자체로는
        "위는 밝고 아래는 검정"이 되지 않는다. 수직 스크림을 한 겹 얹어
        레퍼런스의 명암 구조를 만들고, 하단을 --bg와 같은 검정으로 떨어뜨린다.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,12,12,0.42) 0%, rgba(12,12,12,0.12) 22%, rgba(12,12,12,0.34) 52%, rgba(12,12,12,0.82) 78%, #0c0c0c 100%)",
        }}
      />

      {/* 텍스트가 얹히는 중앙부를 한 번 더 눌러 흰 글씨 대비를 확보 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 45% at 50% 46%, rgba(12,12,12,0.34) 0%, rgba(12,12,12,0) 100%)",
        }}
      />
    </div>
  );
}
