import FadeIn from "@/components/ui/FadeIn";
import type { OrnamentProps } from "./PixelOrnaments";

export interface DecorItem {
  Shape: (props: OrnamentProps) => React.ReactElement;
  /** 세로 위치만 지정한다. 가로는 본문 폭에 맞춰 계산한다. */
  position: string;
  /** 여백이 충분할 때의 최대 폭(px) */
  max: number;
  /** 본문에서 더 밀어낼 거리(px). 같은 쪽 장식끼리 세로줄이 겹치지 않게 흩는다. */
  offset?: number;
  delay: number;
  /** 좌우 어느 쪽 여백에 놓을지 */
  from: "left" | "right";
}

/**
 * 섹션 모서리에 픽셀 오브젝트를 깔아준다.
 *
 * 가로 위치를 뷰포트 비율(left-[4%])로 잡으면 태블릿 폭에서 본문 위로 올라탄다.
 * 그래서 본문 폭(content)을 기준으로 바깥 여백에만 놓고, 폭도 남는 여백만큼만
 * 준다. 여백이 모자라면 clamp가 0으로 접어 자연스럽게 사라진다.
 *
 * 본문 뒤(z-0)에 두고 pointer-events와 aria에서 빼 읽기를 방해하지 않는다.
 */
export default function SectionDecor({
  items,
  content,
  tone = "light",
  opacity = "opacity-60",
  gap = 24,
  edge = 16,
  minWidth = 72,
}: {
  items: DecorItem[];
  /** 이 섹션 본문의 최대 폭(px). 장식은 이 바깥에만 놓인다. */
  content: number;
  tone?: "light" | "ink";
  opacity?: string;
  /** 본문과 장식 사이 최소 간격 */
  gap?: number;
  /** 화면 가장자리와 장식 사이 최소 간격 */
  edge?: number;
  /** 이 폭보다 작게 나올 여백이면 아예 그리지 않는다 */
  minWidth?: number;
}) {
  const half = content / 2;

  return (
    <>
      {items.map(({ Shape, position, max, offset = 0, delay, from }, i) => {
        /** 본문 바깥에 이 장식이 쓸 수 있는 여백 폭 */
        const avail = `calc(50% - ${half + gap + edge + offset}px)`;

        return (
          <FadeIn
            key={i}
            delay={delay}
            duration={0.9}
            x={from === "left" ? -80 : 80}
            y={0}
            className={`pointer-events-none absolute z-0 ${position}`}
            style={{
              // 여백만큼만 쓰되(min), 여백이 minWidth에 못 미치면 0으로 접는다.
              // 큰 배수를 곱한 clamp가 계단 역할을 한다 — 부스러기 같은 몇 px짜리
              // 조각으로 남느니 아예 사라지는 편이 낫다.
              width: `min(clamp(0px, calc((${avail} - ${minWidth}px) * 100), ${max}px), ${avail})`,
              [from === "left" ? "right" : "left"]:
                `calc(50% + ${half + gap + offset}px)`,
            }}
          >
            <Shape className={`h-auto w-full ${opacity}`} tone={tone} />
          </FadeIn>
        );
      })}
    </>
  );
}
