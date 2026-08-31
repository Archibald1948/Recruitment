"use client";

import { useEffect, useRef } from "react";

/**
 * 배경에 옅게 깔리는 도트 글리프 텍스처.
 * 레퍼런스의 "0 0 8 8 S S" 텍스처를 캔버스로 직접 그린 것 — 외부 에셋 없음.
 */
const GLYPHS = "01188SSXX#%*<>";

export default function GlyphField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // canvas의 font 문자열은 CSS 변수를 해석하지 못하므로 실제 패밀리명을 꺼내 쓴다.
    const pixelFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-pixel").trim() ||
      "monospace";

    type Cell = { x: number; y: number; ch: string; phase: number; period: number; peak: number };
    let cells: Cell[] = [];
    let cell = 18;
    let raf = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cell = Math.max(15, Math.min(24, w * 0.017));
      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);

      cells = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // 전체를 채우지 않고 듬성듬성 — 노이즈가 아니라 텍스처로 읽히게
          if (Math.random() > 0.42) continue;
          cells.push({
            x: c * cell + cell / 2,
            y: r * cell + cell / 2,
            ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            phase: Math.random() * Math.PI * 2,
            period: 4000 + Math.random() * 5000,
            peak: 0.1 + Math.random() * 0.11,
          });
        }
      }
    };

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${Math.round(cell * 0.78)}px ${pixelFamily}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const c of cells) {
        const wave = reduced ? 0.6 : (Math.sin((t / c.period) * Math.PI * 2 + c.phase) + 1) / 2;
        // 아래로 갈수록 사라지게 — 하단 검정 페이드와 겹쳐 지저분해지지 않도록
        const depth = 1 - Math.min(1, Math.max(0, c.y / h - 0.08) / 0.62);

        // 배경이 위쪽은 밝고 아래쪽은 어둡다. 흰색으로만 그리면 상단에서 아예 보이지 않으므로
        // 밝은 구간에서는 어두운 글리프로 뒤집는다.
        const t2 = Math.min(1, Math.max(0, (c.y / h - 0.16) / 0.22));
        const ch = Math.round(74 + (255 - 74) * t2);
        const alpha = c.peak * wave * depth * (t2 < 0.5 ? 1.45 : 1);
        ctx.fillStyle = `rgba(${ch},${Math.round(58 + (255 - 58) * t2)},${Math.round(44 + (255 - 44) * t2)},${alpha.toFixed(4)})`;
        ctx.fillText(c.ch, c.x, c.y);
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      layout();
      if (reduced) draw(0);
    };

    layout();
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
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  );
}
