"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * 히어로 배경.
 *
 * MeshGradient만으로는 색이 유기적으로 흩어져 "위는 옅은 회색, 아래는 주황"
 * 같은 세로 방향 서사를 만들 수 없다. 그래서 두 겹으로 쌓는다.
 *
 *   1) 세로 그라디언트  — 색의 순서를 결정한다 (회색 → 주황 → 검정)
 *   2) MeshGradient     — 그 위에 블렌드로 얹어 유기적인 덩어리와 움직임만 더한다
 *
 * 마지막 색은 반드시 --bg(#0C0C0C)와 같아야 다음 섹션과 이음매가 사라진다.
 */

/** 세로 색 서사. 상단은 밝게 두고 아래로 내려가며 주황을 지나 검정으로 떨어진다. */
const VERTICAL =
  "linear-gradient(180deg," +
  " #eeecea 0%," +
  " #e9e4de 10%," +
  " #dcc7ad 22%," +
  " #c98a4e 36%," +
  " #a35113 48%," +
  " #5f2609 62%," +
  " #2a1206 76%," +
  " #120802 88%," +
  " #0c0c0c 100%)";

/** 위에 얹는 유기적 덩어리. 세로 그라디언트와 같은 온도로 맞춘다. */
const MESH = ["#f5f2ee", "#e8c49a", "#c26a12", "#5c2406", "#0c0c0c"];

export default function MeshBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <div className="absolute inset-0" style={{ background: VERTICAL }} />

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={MESH}
        distortion={0.9}
        swirl={0.6}
        grainMixer={0.15}
        grainOverlay={0.06}
        speed={reduced ? 0 : 0.16}
        frame={reduced ? 12_000 : undefined}
        style={{ mixBlendMode: "soft-light", opacity: 0.8 }}
      />

      {/* 헤드라인이 얹히는 중앙부를 눌러 흰 글씨 대비를 확보한다. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(82% 44% at 50% 40%, rgba(24,9,2,0.5) 0%, rgba(24,9,2,0.2) 58%, rgba(24,9,2,0) 100%)",
        }}
      />

      {/* 하단을 --bg와 같은 검정으로 떨어뜨려 다음 섹션과 무이음 연결 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[46vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.72) 55%, #0c0c0c 85%)",
        }}
      />
    </div>
  );
}
