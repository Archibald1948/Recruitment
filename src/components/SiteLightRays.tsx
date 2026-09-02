"use client";

import { LightRays } from "@/components/magicui/light-rays";

/**
 * 사이트 전체에 깔리는 광선.
 *
 * 원래는 히어로 안에 넣는 컴포넌트지만, 여기서는 `fixed`로 화면에 고정해
 * 스크롤해도 따라오게 한다. 섹션 배경을 투명하게 두면 그 위로 비친다.
 *
 * z-[1]에 두는 이유: 히어로 배경(z-0) 위, 본문(z-10) 아래에 놓여야
 * 배경 위로는 비치되 글자를 가리지 않는다.
 */
export default function SiteLightRays() {
  return (
    <LightRays
      aria-hidden
      className="fixed inset-0 z-[1]"
      // 히어로 팔레트의 로즈 톤. 파란빛 기본값은 이 사이트와 맞지 않는다.
      color="rgba(238, 202, 210, 0.16)"
      count={9}
      blur={44}
      speed={18}
      length="88vh"
    />
  );
}
