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

/*
 * 웨이브는 **경계가 보여야** 두 개로 읽힌다.
 * 어두운 덩어리(BODY)만 겹치면 하나의 뭉개진 그림자로 보이므로,
 * 각 덩어리의 가장자리에 밝은 테두리(RIM)를 한 겹씩 얹는다.
 * 두 테두리가 서로 다른 높이에서 각각 호를 그리며 반대 방향으로 움직인다.
 */

/** 웨이브 1 — 위쪽 파도. 화면 가운데를 가로지른다. */
const WAVE1_BODY =
  "radial-gradient(56% 26% at 50% 44%," +
  " rgba(10,6,7,0.96) 0%," +
  " rgba(22,12,14,0.9) 48%," +
  " rgba(60,32,34,0.5) 74%," +
  " rgba(60,32,34,0) 100%)";

const WAVE1_RIM =
  "radial-gradient(58% 28% at 50% 44%," +
  " rgba(236,196,186,0) 60%," +
  " rgba(236,196,186,0.34) 72%," +
  " rgba(236,196,186,0.10) 80%," +
  " rgba(236,196,186,0) 90%)";

/** 웨이브 2 — 아래쪽 파도. 1번과 겹치며 층을 만든다. */
const WAVE2_BODY =
  "radial-gradient(96% 40% at 50% 100%," +
  " #0c0c0c 34%," +
  " rgba(14,8,7,0.95) 50%," +
  " rgba(56,28,20,0.66) 66%," +
  " rgba(56,28,20,0) 88%)";

const WAVE2_RIM =
  "radial-gradient(98% 42% at 50% 100%," +
  " rgba(246,182,150,0) 52%," +
  " rgba(246,182,150,0.30) 64%," +
  " rgba(246,182,150,0.09) 73%," +
  " rgba(246,182,150,0) 84%)";

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

      {/* 두 웨이브는 반대 방향으로, 서로 다른 주기로 움직인다. */}
      <div className="wave-a absolute -inset-[10%]">
        <div className="absolute inset-0" style={{ background: WAVE1_BODY }} />
        <div className="absolute inset-0" style={{ background: WAVE1_RIM }} />
      </div>
      <div className="wave-b absolute -inset-[10%]">
        <div className="absolute inset-0" style={{ background: WAVE2_BODY }} />
        <div className="absolute inset-0" style={{ background: WAVE2_RIM }} />
      </div>

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
