"use client";

import Stats, { type Stat } from "./Stats";

/**
 * 히어로 지표.
 *
 * 지원자 수는 화면에서 뺐다. 지원 전에 "지금 몇 명 지원했다"를 보여주면
 * 숫자가 적을 때는 인기 없어 보이고, 많을 때는 경쟁률로 읽혀 지원을 망설이게 한다.
 * 집계 자체는 그대로 살아 있다 — /api/stats가 계속 내려주고, 운영진은 노션에서 본다.
 */
export default function LiveStats({
  remaining,
  partCount,
  months,
}: {
  remaining: number;
  partCount: number;
  months: number;
}) {
  const stats: Stat[] = [
    { glyph: "<", value: remaining, suffix: "일", decimals: 0, label: "지원 마감까지" },
    {
      // *는 이 픽셀 폰트에서 작고 위로 붙어 나와 옆 글리프들과 무게가 안 맞았다.
      // +는 가운데 정렬이라 <, # 과 나란히 놓았을 때 균형이 잡힌다.
      glyph: "+",
      value: partCount,
      suffix: "파트",
      decimals: 0,
      label: "함께할 파트",
      // 몇 개인지보다 어떤 파트인지가 중요해 이름을 순서대로 돌린다.
      values: ["Design", "Frontend", "Planning", "Backend"],
    },
    { glyph: "#", value: months, suffix: "개월+", decimals: 0, label: "예상 기간" },
  ];

  return <Stats stats={stats} />;
}
