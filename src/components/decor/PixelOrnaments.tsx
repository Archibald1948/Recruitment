/**
 * 코너 장식 오브젝트.
 *
 * 레퍼런스의 3D 오브젝트 4개는 전부 외부 사이트 핫링크라 쓸 수 없어,
 * 히어로의 도트 글리프·픽셀 폰트와 같은 언어로 직접 그렸다.
 * 이미지가 아니라 SVG 사각형 격자라 용량이 거의 없고 색도 토큰을 따른다.
 */

type Tone = number | null;

const RAMP: [number, number, number][] = [
  [238, 236, 234], // 옅은 회색
  [201, 138, 78], // 앰버
  [92, 36, 6], // 번트 오렌지
];

function toneColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const [r, g, b] = RAMP[i].map((c, k) => Math.round(c + (RAMP[i + 1][k] - c) * f));
  return `rgb(${r} ${g} ${b})`;
}

const dist = (x: number, y: number, cx: number, cy: number) => Math.hypot(x - cx, y - cy);

function PixelShape({
  n,
  shape,
  className,
}: {
  n: number;
  shape: (x: number, y: number) => Tone;
  className?: string;
}) {
  const cells: { x: number; y: number; t: number }[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const t = shape(x, y);
      if (t !== null) cells.push({ x, y, t });
    }
  }

  return (
    <svg viewBox={`0 0 ${n} ${n}`} className={className} aria-hidden focusable="false">
      {cells.map((c) => (
        <rect
          key={`${c.x}-${c.y}`}
          x={c.x + 0.07}
          y={c.y + 0.07}
          width={0.86}
          height={0.86}
          rx={0.16}
          fill={toneColor(c.t)}
        />
      ))}
    </svg>
  );
}

/** 초승달 — 원에서 살짝 어긋난 원을 덜어냈다. */
export function PixelMoon({ className }: { className?: string }) {
  return (
    <PixelShape
      n={16}
      className={className}
      shape={(x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        const d1 = dist(px, py, 8, 8);
        const d2 = dist(px, py, 11.4, 5.6);
        if (d1 > 7 || d2 <= 6.4) return null;
        return 0.15 + (d1 / 7) * 0.75;
      }}
    />
  );
}

/** 궤도 링과 위성 */
export function PixelOrbit({ className }: { className?: string }) {
  return (
    <PixelShape
      n={16}
      className={className}
      shape={(x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        const satellite = dist(px, py, 13, 3);
        if (satellite <= 1.7) return 0.1;
        const r = dist(px, py, 7.5, 8.5);
        if (r < 4.4 || r > 6.8) return null;
        return 0.25 + ((r - 4.4) / 2.4) * 0.7;
      }}
    />
  );
}

/** 블록 격자 — 3×3 덩어리 */
export function PixelBlocks({ className }: { className?: string }) {
  return (
    <PixelShape
      n={16}
      className={className}
      shape={(x, y) => {
        const bx = Math.floor(x / 5);
        const by = Math.floor(y / 5);
        if (bx > 2 || by > 2) return null;
        if (x % 5 === 4 || y % 5 === 4) return null;
        return 0.1 + ((bx + by) / 4) * 0.8;
      }}
    />
  );
}

/** 구체 — 왼쪽 위에 광원을 둔 음영 */
export function PixelSphere({ className }: { className?: string }) {
  return (
    <PixelShape
      n={16}
      className={className}
      shape={(x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        if (dist(px, py, 8, 8) > 7) return null;
        return Math.min(1, dist(px, py, 4.8, 4.8) / 12.5);
      }}
    />
  );
}
