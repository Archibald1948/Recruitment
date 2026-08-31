"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

/**
 * 히어로 배경.
 *
 * 레퍼런스는 렌더링된 영상이라 그대로 가져올 수 없다. 대신 그 인상을 만드는
 * 네 가지 요소를 레이어로 분해해 직접 쌓는다.
 *
 *   1) 세로 그라디언트  — 옅은 회색에서 주황을 지나 검정으로 떨어지는 색 순서
 *   2) 지평선 타원      — 화면 아래에 걸친 커다란 어두운 덩어리. 위쪽 경계가 곡선을 만든다
 *   3) 웨이브           — MeshGradient를 soft-light로 얹어 유기적인 움직임만 더한다
 *   4) 그레인           — 레퍼런스의 거친 질감. 이게 없으면 CSS 그라디언트 티가 난다
 *
 * 마지막 색은 반드시 --bg(#0C0C0C)와 같아야 다음 섹션과 이음매가 사라진다.
 */

const VERTICAL =
  "linear-gradient(180deg," +
  " #f0eeec 0%," +
  " #eae5df 12%," +
  " #e6c2ab 24%," +
  " #dda478 34%," +
  " #cf8348 44%," +
  " #a85717 52%," +
  " #6a2c0b 64%," +
  " #2c1307 78%," +
  " #120802 90%," +
  " #0c0c0c 100%)";

/** 화면 아래에 걸친 어두운 덩어리. 위쪽 경계가 레퍼런스의 지평선 곡선이 된다. */
const HORIZON =
  "radial-gradient(112% 66% at 50% 112%," +
  " #0c0c0c 44%," +
  " rgba(18,7,2,0.97) 54%," +
  " rgba(46,16,4,0.82) 62%," +
  " rgba(96,38,9,0.42) 69%," +
  " rgba(150,66,18,0.10) 76%," +
  " rgba(150,66,18,0) 82%)";

/** 지평선 바로 위에서 번지는 따뜻한 빛 */
const RIM =
  "radial-gradient(90% 42% at 46% 74%," +
  " rgba(255,168,74,0.30) 0%," +
  " rgba(214,96,20,0.14) 45%," +
  " rgba(214,96,20,0) 75%)";

const MESH = ["#f7f4f0", "#e8c49a", "#c26a12", "#5c2406", "#0c0c0c"];

/** feTurbulence 노이즈를 배경 이미지로 굽는다. 외부 파일 없이 그레인을 만든다. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function MeshBackdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0c0c0c]">
      <div className="absolute inset-0" style={{ background: VERTICAL }} />

      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={MESH}
        distortion={0.92}
        swirl={0.62}
        grainMixer={0.18}
        grainOverlay={0.08}
        speed={reduced ? 0 : 0.14}
        frame={reduced ? 12_000 : undefined}
        style={{ mixBlendMode: "soft-light", opacity: 0.72 }}
      />

      <div className="absolute inset-0" style={{ background: RIM }} />
      <div className="absolute inset-0" style={{ background: HORIZON }} />

      {/* 헤드라인이 얹히는 중앙부를 눌러 흰 도트 대비를 확보한다. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 40% at 50% 40%, rgba(24,9,2,0.42) 0%, rgba(24,9,2,0.14) 60%, rgba(24,9,2,0) 100%)",
        }}
      />

      {/* 그레인. 레퍼런스의 거친 질감은 이 레이어가 만든다. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          backgroundRepeat: "repeat",
          mixBlendMode: "overlay",
          opacity: 0.38,
        }}
      />

      {/* 하단을 --bg와 같은 검정으로 떨어뜨려 다음 섹션과 무이음 연결 */}
      <div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,12,12,0) 0%, rgba(12,12,12,0.7) 50%, #0c0c0c 88%)",
        }}
      />
    </div>
  );
}
