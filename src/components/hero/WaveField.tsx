"use client";

import { useEffect, useRef } from "react";

/**
 * 히어로의 파도 두 겹.
 *
 * 라디얼 그라디언트로는 이 형태가 나오지 않는다. 타원은 가장자리가 매끈해서
 * "덩어리 두 개가 겹친" 인상이 아니라 하나의 뭉개진 그림자로 읽힌다.
 *
 * 그래서 실제 파도처럼 **여러 사인파를 합성한 물결 곡선**을 윗변으로 삼는 도형을
 * 두 개 그린다. 각 도형은 윗변에 따뜻한 테두리를 두고 아래로 어두워지며,
 * 위 파도는 아래쪽에서 투명해져 그 아래 밝은 띠가 드러난다.
 * 그 밝은 띠가 두 파도를 갈라 보이게 하는 핵심이다.
 */

interface WaveSpec {
  /** 파도 윗변의 기준 높이 (0~1) */
  base: number;
  /** 물결 진폭 (높이 대비) */
  amp: number;
  /** 합성할 사인파들 — [주기 배수, 진폭 비율, 위상] */
  harmonics: [number, number, number][];
  /** 위아래로 흔들리는 주기(초) */
  driftPeriod: number;
  /** 흔들리는 폭 (높이 대비) */
  driftAmp: number;
  /** 윗변 테두리 색 */
  rim: string;
  /** 도형 색 정지점 — [위치(도형 높이 대비), 색] */
  stops: [number, string][];
  /** 가장자리 흐림 정도 (px) */
  blur: number;
}

const WAVES: WaveSpec[] = [
  {
    // 위 파도 — 헤드라인이 이 위에 앉는다. 아래쪽에서 투명해져 밝은 띠가 드러난다.
    base: 0.33,
    amp: 0.038,
    harmonics: [
      [1, 1, 0],
      [2.3, 0.42, 1.7],
      [3.7, 0.22, 3.4],
    ],
    driftPeriod: 19,
    driftAmp: 0.02,
    rim: "rgba(236,164,162,0.95)",
    stops: [
      [0, "rgba(228,150,150,0.9)"],
      [0.035, "rgba(88,42,44,0.99)"],
      [0.1, "rgba(12,6,8,1)"],
      [0.3, "rgba(12,6,8,1)"],
      [0.42, "rgba(12,6,8,0.55)"],
      [0.52, "rgba(12,6,8,0)"],
      [1, "rgba(12,6,8,0)"],
    ],
    blur: 11,
  },
  {
    // 아래 파도 — 화면 바닥까지 채우며 검정으로 떨어진다
    base: 0.72,
    amp: 0.032,
    harmonics: [
      [1, 1, 2.2],
      [2.7, 0.38, 0.6],
      [4.1, 0.18, 5.1],
    ],
    driftPeriod: 27,
    driftAmp: 0.024,
    rim: "rgba(214,132,116,0.95)",
    stops: [
      [0, "rgba(206,130,114,0.92)"],
      [0.06, "rgba(92,46,38,0.99)"],
      [0.2, "rgba(16,8,7,1)"],
      [0.7, "#0c0c0c"],
      [1, "#0c0c0c"],
    ],
    blur: 13,
  },
];

export default function WaveField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** 사인파를 합성해 물결 곡선의 y좌표를 구한다. */
    const edgeY = (spec: WaveSpec, x: number, t: number) => {
      const drift = Math.sin((t / (spec.driftPeriod * 1000)) * Math.PI * 2) * spec.driftAmp;
      const wave = spec.harmonics.reduce(
        (sum, [mult, weight, phase]) =>
          sum + Math.sin((x / w) * Math.PI * 2 * mult + phase + t / (spec.driftPeriod * 900)) * weight,
        0,
      );
      const norm = spec.harmonics.reduce((s, [, weight]) => s + weight, 0);
      return h * (spec.base + drift) + (wave / norm) * h * spec.amp;
    };

    const drawWave = (spec: WaveSpec, t: number) => {
      const top = h * spec.base - h * spec.amp - h * spec.driftAmp;
      const height = h - top;

      const grad = ctx.createLinearGradient(0, top, 0, h);
      for (const [pos, color] of spec.stops) grad.addColorStop(Math.min(1, pos), color);

      ctx.save();
      // 가장자리를 흐리게 해야 에어브러시로 그린 듯한 부드러운 경계가 나온다.
      ctx.filter = `blur(${spec.blur}px)`;

      ctx.beginPath();
      ctx.moveTo(-spec.blur * 2, h + spec.blur * 2);
      const step = Math.max(4, Math.floor(w / 160));
      for (let x = -spec.blur * 2; x <= w + spec.blur * 2; x += step) {
        ctx.lineTo(x, edgeY(spec, x, t));
      }
      ctx.lineTo(w + spec.blur * 2, h + spec.blur * 2);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      // 윗변에 따뜻한 빛 — 파도의 마루가 반짝이는 부분
      ctx.filter = `blur(${spec.blur * 0.55}px)`;
      ctx.beginPath();
      for (let x = -spec.blur * 2; x <= w + spec.blur * 2; x += step) {
        const y = edgeY(spec, x, t);
        if (x === -spec.blur * 2) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = spec.rim;
      ctx.lineWidth = Math.max(2, h * 0.006);
      ctx.stroke();
      ctx.restore();

      void height;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const spec of WAVES) drawWave(spec, reduced ? 8000 : t);
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      if (reduced) draw(0);
    };

    resize();
    if (reduced) draw(0);
    else raf = requestAnimationFrame(draw);

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
