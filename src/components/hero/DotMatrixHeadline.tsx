"use client";

import { useEffect, useRef } from "react";

/**
 * 헤드라인을 둥근 도트 매트릭스로 그린다.
 *
 * 레퍼런스의 디스플레이 폰트(BubbledotICG)는 출처가 불분명한 CDN 폰트라 쓸 수 없고,
 * Google Fonts의 픽셀 폰트는 전부 네모 픽셀이라 둥근 도트가 나오지 않는다.
 * 그래서 폰트를 쓰지 않고 직접 그린다.
 *
 *   1) 글자를 저해상도 오프스크린 캔버스에 그린다 (픽셀 1개 = 도트 1개)
 *   2) 알파가 있는 자리에만 원을 찍는다
 *
 * 격자는 **대문자 높이(capRows)를 기준으로** 잡는다. 폭을 먼저 정하면 긴 줄에서
 * 글자당 도트가 모자라 뭉개진다. 그리고 도트 크기는 가장 긴 줄에 맞춰 한 번만
 * 계산해 모든 줄이 같은 크기를 쓰게 한다.
 */

const FONT = (px: number) => `800 ${px}px "Helvetica Neue", Arial, sans-serif`;
/** 저해상도 캔버스에서 쓸 기준 글자 크기. 클수록 계산이 정확하다. */
const BASE = 100;
/** 대문자 높이는 대략 em의 0.72배 */
const CAP_RATIO = 0.72;

export default function DotMatrixHeadline({
  lines,
  capRows = 11,
  gapRows = 4,
  delays = [],
  className,
}: {
  lines: string[];
  /** 대문자 하나가 차지하는 도트 행 수. 글자 또렷함을 좌우한다. */
  capRows?: number;
  /** 줄 사이 여백(행 단위) */
  gapRows?: number;
  delays?: number[];
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const render = () => {
      const width = wrap.clientWidth;
      if (!width) return;

      const probe = document.createElement("canvas").getContext("2d");
      if (!probe) return;

      // 기준 크기에서 각 줄의 폭을 재고, 대문자 높이가 capRows가 되도록 환산한다.
      probe.font = FONT(BASE);
      try {
        probe.letterSpacing = `${BASE * 0.06}px`;
      } catch {
        /* letterSpacing 미지원 브라우저는 기본 자간으로 간다 */
      }
      const unitsPerRow = (BASE * CAP_RATIO) / capRows;
      const cols = lines.map((l) => Math.ceil(probe.measureText(l).width / unitsPerRow));
      const maxCols = Math.max(...cols, 1);

      // 도트 크기는 가장 긴 줄 기준으로 한 번만 정한다 — 모든 줄이 같은 크기를 쓴다.
      const cell = width / maxCols;
      const rows = capRows + gapRows;
      const fontPx = (capRows / CAP_RATIO) * (BASE / BASE);

      lines.forEach((line, i) => {
        const canvas = canvasRefs.current[i];
        if (!canvas) return;

        const src = document.createElement("canvas");
        src.width = maxCols;
        src.height = rows;
        const sctx = src.getContext("2d", { willReadFrequently: true });
        if (!sctx) return;

        sctx.font = FONT(fontPx);
        try {
          sctx.letterSpacing = `${fontPx * 0.06}px`;
        } catch {
          /* noop */
        }
        sctx.textAlign = "center";
        sctx.textBaseline = "middle";
        sctx.fillStyle = "#fff";
        sctx.fillText(line, maxCols / 2, rows / 2);

        const data = sctx.getImageData(0, 0, maxCols, rows).data;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const h = rows * cell;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(h * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, h);
        ctx.fillStyle = "#fff";

        const r = cell * 0.36;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < maxCols; x++) {
            const alpha = data[(y * maxCols + x) * 4 + 3];
            if (alpha < 70) continue;
            ctx.globalAlpha = Math.min(1, 0.35 + alpha / 255);
            ctx.beginPath();
            ctx.arc(x * cell + cell / 2, y * cell + cell / 2, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      });
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(wrap);
    document.fonts?.ready.then(render).catch(() => {});
    return () => ro.disconnect();
  }, [lines, capRows, gapRows]);

  return (
    <div ref={wrapRef} className={className}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <canvas
          key={line}
          ref={(el) => {
            canvasRefs.current[i] = el;
          }}
          aria-hidden
          className="anim-line block w-full"
          style={{ ["--d" as string]: `${delays[i] ?? 0.12 + i * 0.18}s` }}
        />
      ))}
    </div>
  );
}
