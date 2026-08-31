"use client";

import { useEffect, useRef } from "react";

/**
 * 상단을 채우는 도트 문자 격자.
 *
 * 레퍼런스에서 화면을 지배하는 요소다. 배경 장식이 아니라 **하나의 텍스처 면**으로,
 * 상단 절반을 크고 조밀한 글자로 꽉 채운 뒤 아래 파도에 흡수되며 사라진다.
 * 성기게 깔면 그냥 노이즈로 보이고, 옅게 깔면 아예 보이지 않는다.
 */
const GLYPHS = "0088SSSXX#$%538";

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
    let cell = 20;
    let raf = 0;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 가로 70~85칸. 레퍼런스의 글자 크기감에 맞춘다.
      cell = Math.max(16, Math.min(30, w / 76));
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;

      cells = [];
      for (let r = 0; r < rows; r++) {
        const rowRatio = r / rows;
        // 위쪽은 거의 꽉 차고, 파도가 시작되는 지점부터 급격히 성겨진다.
        const density = rowRatio < 0.3 ? 0.95 : Math.max(0, 0.95 - (rowRatio - 0.3) * 3.2);
        for (let c = 0; c < cols; c++) {
          if (Math.random() > density) continue;
          cells.push({
            x: c * cell + cell / 2,
            y: r * cell + cell / 2,
            ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            phase: Math.random() * Math.PI * 2,
            period: 3500 + Math.random() * 5500,
            peak: 0.3 + Math.random() * 0.34,
          });
        }
      }
    };

    const draw = (t: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${Math.round(cell * 0.86)}px ${pixelFamily}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const c of cells) {
        const wave = reduced ? 0.7 : 0.45 + ((Math.sin((t / c.period) * Math.PI * 2 + c.phase) + 1) / 2) * 0.55;
        // 파도에 흡수되며 사라진다.
        const depth = 1 - Math.min(1, Math.max(0, c.y / h - 0.22) / 0.16);
        const alpha = c.peak * wave * depth;
        if (alpha < 0.012) continue;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
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
