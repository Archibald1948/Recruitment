import FadeIn from "@/components/ui/FadeIn";
import type { OrnamentProps } from "./PixelOrnaments";

export interface DecorItem {
  Shape: (props: OrnamentProps) => React.ReactElement;
  /** Tailwind 위치 클래스 */
  position: string;
  /** Tailwind 크기 클래스 */
  size: string;
  delay: number;
  /** 좌우 어느 쪽에서 밀려 들어올지 */
  from: "left" | "right";
}

/**
 * 섹션 모서리에 픽셀 오브젝트를 깔아준다.
 *
 * About에서 쓰던 방식을 그대로 다른 섹션에도 재사용하되, 모양은 섹션마다 다르게 준다.
 * 본문 뒤(z-0)에 두고 pointer-events와 aria에서 빼 읽기를 방해하지 않는다.
 * 모바일에서는 본문과 겹쳐 지저분해지므로 숨긴다.
 */
export default function SectionDecor({
  items,
  tone = "light",
  opacity = "opacity-60",
}: {
  items: DecorItem[];
  tone?: "light" | "ink";
  opacity?: string;
}) {
  return (
    <>
      {items.map(({ Shape, position, size, delay, from }, i) => (
        <FadeIn
          key={i}
          delay={delay}
          duration={0.9}
          x={from === "left" ? -80 : 80}
          y={0}
          className={`pointer-events-none absolute z-0 hidden sm:block ${position} ${size}`}
        >
          <Shape className={`h-auto w-full ${opacity}`} tone={tone} />
        </FadeIn>
      ))}
    </>
  );
}
