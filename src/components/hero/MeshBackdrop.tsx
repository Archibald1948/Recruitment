"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * 히어로 배경.
 *
 * 레퍼런스는 렌더링된 영상이라 그대로 가져올 수 없다. 대신 그 인상을 만드는
 * 요소를 레이어로 분해해 직접 쌓는다.
 *
 *   1) 세로 그라디언트 — 페리윙클 → 라벤더 → 피치 → 모브 → 검정
 *      단색 주황이 아니라 **여러 색이 섞인 저채도 팔레트**다. 이게 핵심.
 *   2) 좌우 비대칭 틴트 — 왼쪽은 따뜻한 피치, 오른쪽은 차가운 라벤더
 *   3) 웨이브 2겹      — 중앙의 커다란 렌즈와 하단의 곡선이 겹친다
 *   4) 그레인          — 없으면 CSS 그라디언트 티가 난다
 *
 * 마지막 색은 반드시 --bg(#0C0C0C)와 같아야 다음 섹션과 이음매가 사라진다.
 */

/**
 * 상단을 흰색에 가깝게 두면 글리프 텍스처가 묻힌다.
 * 레퍼런스처럼 중간 톤 페리윙클로 시작해야 흰 글자가 읽힌다.
 */
const VERTICAL =
  "linear-gradient(180deg," +
  " #c4c3d9 0%," +
  " #cfc8dc 9%," +
  " #ded0d3 18%," +
  " #e3c8bd 27%," +
  " #d8aea8 36%," +
  " #b98a8c 46%," +
  " #8a5c58 57%," +
  " #4a2a28 69%," +
  " #1d1211 82%," +
  " #0c0c0c 100%)";

/** 좌우 색이 달라야 단조로워지지 않는다. */
const SIDE_TINT =
  "radial-gradient(58% 46% at 6% 28%, rgba(240,190,152,0.52) 0%, rgba(240,190,152,0) 72%)," +
  "radial-gradient(54% 42% at 96% 22%, rgba(196,188,228,0.50) 0%, rgba(196,188,228,0) 72%)," +
  "radial-gradient(46% 30% at 78% 58%, rgba(214,150,160,0.34) 0%, rgba(214,150,160,0) 74%)";

/** 웨이브 1 — 화면 한가운데를 가로지르는 커다란 렌즈. 가장자리에 모브빛 테두리가 남는다. */
const LENS =
  "radial-gradient(58% 29% at 50% 49%," +
  " rgba(10,6,7,0.98) 0%," +
  " rgba(20,11,13,0.95) 46%," +
  " rgba(62,33,35,0.62) 70%," +
  " rgba(150,92,90,0.20) 87%," +
  " rgba(150,92,90,0) 100%)";

/** 웨이브 2 — 아래에서 올라오는 곡선. 렌즈와 겹치며 자연스러운 층을 만든다. */
const HORIZON =
  "radial-gradient(126% 50% at 50% 108%," +
  " #0c0c0c 44%," +
  " rgba(14,8,7,0.97) 56%," +
  " rgba(54,26,19,0.78) 66%," +
  " rgba(132,70,48,0.28) 76%," +
  " rgba(132,70,48,0) 86%)";

/** 유기적인 움직임만 담당한다. 색은 저채도로 맞춰 세로 서사를 흐리지 않게 한다. */
const MESH = ["#dcd8e8", "#e7c6b1", "#bb8b8d", "#4c2b2c", "#0c0c0c"];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function MeshBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <div className="absolute inset-0" style={{ background: VERTICAL }} />
      <div className="wave-b absolute -inset-[10%]" style={{ background: SIDE_TINT }} />

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={MESH}
        distortion={0.88}
        swirl={0.55}
        grainMixer={0.14}
        grainOverlay={0.06}
        speed={reduced ? 0 : 0.2}
        frame={reduced ? 12_000 : undefined}
        style={{ mixBlendMode: "soft-light", opacity: 0.62 }}
      />

      {/* 두 웨이브는 각자 다른 주기로 흐른다. 스케일 시 가장자리가 드러나지 않도록 오버스캔. */}
      <div className="wave-a absolute -inset-[8%]" style={{ background: LENS }} />
      <div className="wave-b absolute -inset-[8%]" style={{ background: HORIZON }} />

      {/* 그레인. 레퍼런스의 거친 질감은 이 레이어가 만든다. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
          opacity: 0.45,
        }}
      />

      {/* 하단을 --bg와 같은 검정으로 떨어뜨려 다음 섹션과 무이음 연결 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.75) 48%, #0c0c0c 86%)",
        }}
      />
    </div>
  );
}
