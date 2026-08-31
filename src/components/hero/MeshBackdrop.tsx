"use client";

import WaveField from "./WaveField";

/**
 * 히어로 배경.
 *
 * 레퍼런스는 렌더링된 영상이라 그대로 가져올 수 없다. 인상을 만드는 요소를
 * 레이어로 분해해 직접 쌓는다.
 *
 *   1) 세로 그라디언트 — 페리윙클에서 살구빛까지, 파도 위쪽 색을 전부 담당한다
 *   2) 파도 두 겹      — 캔버스로 그린 물결 곡선. 밝은 띠를 사이에 두고 겹친다
 *   3) 그레인          — 없으면 CSS 그라디언트 티가 난다
 *
 * 파도 아래쪽이 #0C0C0C로 끝나므로 다음 섹션과 이음매가 없다.
 */

/**
 * 파도 위 영역의 색. 파도가 덮지 않는 부분은 전부 이 색이 그대로 보인다.
 * 검정은 넣지 않는다 — 어두운 부분은 파도가 만든다.
 */
const VERTICAL =
  "linear-gradient(180deg," +
  " #a8a6c1 0%," +
  " #b9b7cb 10%," +
  " #c6c4d4 20%," +
  " #cac7d2 30%," +
  " #ddc6d6 40%," +
  " #efcadd 50%," +
  " #e9c2c6 60%," +
  " #e1b5ac 70%," +
  " #db898b 84%," +
  " #ae6a61 100%)";

/** 좌우 색이 달라야 단조로워지지 않는다. */
const SIDE_TINT =
  "radial-gradient(56% 42% at 5% 24%, rgba(240,196,164,0.42) 0%, rgba(240,196,164,0) 70%)," +
  "radial-gradient(52% 40% at 96% 18%, rgba(186,182,224,0.44) 0%, rgba(186,182,224,0) 70%)";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function MeshBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <div className="absolute inset-0" style={{ background: VERTICAL }} />
      <div className="absolute inset-0" style={{ background: SIDE_TINT }} />

      <WaveField />

      {/* 그레인. 레퍼런스의 거친 질감은 이 레이어가 만든다. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
          opacity: 0.42,
        }}
      />

      {/* 아주 아래는 확실히 --bg와 같은 검정으로 마무리 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[14vh]"
        style={{ background: "linear-gradient(to bottom, rgba(12,12,12,0) 0%, #0c0c0c 88%)" }}
      />
    </div>
  );
}
