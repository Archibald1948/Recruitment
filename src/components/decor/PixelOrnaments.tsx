/**
 * 코너 장식 오브젝트.
 *
 * 레퍼런스의 3D 오브젝트 4개는 전부 외부 사이트 핫링크라 쓸 수 없어,
 * 히어로의 도트 글리프·픽셀 폰트와 같은 언어로 직접 그렸다.
 * 이미지가 아니라 SVG 사각형 격자라 용량이 거의 없고 색도 토큰을 따른다.
 */

type Tone = number | null;

/** 어두운 배경용 — 밝은 쪽에서 시작해 딥 모브로 */
const RAMP_LIGHT: [number, number, number][] = [
  [222, 216, 232],
  [201, 138, 148],
  [74, 42, 44],
];

/** 흰 배경용 — 잉크 톤 */
const RAMP_INK: [number, number, number][] = [
  [206, 200, 208],
  [140, 96, 104],
  [28, 18, 20],
];

export type Tone_ = "light" | "ink";

function toneColor(t: number, tone: Tone_): string {
  const ramp = tone === "ink" ? RAMP_INK : RAMP_LIGHT;
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const [r, g, b] = ramp[i].map((c, k) => Math.round(c + (ramp[i + 1][k] - c) * f));
  return `rgb(${r} ${g} ${b})`;
}

const dist = (x: number, y: number, cx: number, cy: number) => Math.hypot(x - cx, y - cy);

export interface OrnamentProps {
  className?: string;
  tone?: Tone_;
}

function PixelShape({
  n,
  shape,
  className,
  tone = "light",
}: {
  n: number;
  shape: (x: number, y: number) => Tone;
  className?: string;
  tone?: Tone_;
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
          fill={toneColor(c.t, tone)}
        />
      ))}
    </svg>
  );
}

/** 초승달 — 원에서 살짝 어긋난 원을 덜어냈다. */
export function PixelMoon({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
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
export function PixelOrbit({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
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
export function PixelBlocks({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
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
export function PixelSphere({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
      shape={(x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        if (dist(px, py, 8, 8) > 7) return null;
        return Math.min(1, dist(px, py, 4.8, 4.8) / 12.5);
      }}
    />
  );
}

/** 파도 — 히어로의 웨이브를 도트로 옮긴 형태 */
export function PixelWave({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
      shape={(x, y) => {
        // 서로 다른 위상의 사인 곡선 두 줄. 히어로의 파도 2겹과 같은 언어.
        const a = 5 + Math.sin((x / 16) * Math.PI * 2) * 2.6;
        const b = 10 + Math.sin((x / 16) * Math.PI * 2 + 1.9) * 2.6;
        const near = Math.min(Math.abs(y - a), Math.abs(y - b));
        if (near > 1.1) return null;
        return 0.15 + (near / 1.1) * 0.7;
      }}
    />
  );
}

/** 마름모 테두리 */
export function PixelDiamond({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
      shape={(x, y) => {
        const d = Math.abs(x - 7.5) + Math.abs(y - 7.5);
        if (d < 4.6 || d > 7.4) return null;
        return 0.2 + ((d - 4.6) / 2.8) * 0.7;
      }}
    />
  );
}

/** 성긴 점 격자 — 아래로 갈수록 촘촘해진다 */
export function PixelGrid({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
      shape={(x, y) => {
        const step = y < 6 ? 3 : y < 11 ? 2 : 1;
        if (x % step !== 0 || y % (step === 1 ? 1 : step) !== 0) return null;
        return 0.1 + (y / 16) * 0.8;
      }}
    />
  );
}

/** 겹친 호 — 신호가 퍼져나가는 모양 */
export function PixelArc({ className, tone }: OrnamentProps) {
  return (
    <PixelShape
      n={16}
      className={className}
      tone={tone}
      shape={(x, y) => {
        const r = dist(x + 0.5, y + 0.5, 1.5, 14.5);
        for (const [ring, t] of [
          [4.5, 0.15],
          [8.5, 0.45],
          [12.5, 0.8],
        ] as const) {
          if (Math.abs(r - ring) <= 0.9) return t;
        }
        return null;
      }}
    />
  );
}
