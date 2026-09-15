"use client";

import { formatTimeLeft, timeLeft } from "@/config/site";
import { useNow } from "@/lib/useNow";
import Stats, { type Stat } from "./Stats";

// 몇 개인지보다 어떤 파트인지가 중요해 이름을 순서대로 돌린다.
// 컴포넌트 밖에 둔다. 시계가 매초 다시 그리는데, 배열을 안에서 새로 만들면
// 타자기 효과가 매초 처음부터 다시 시작한다.
const PART_NAMES = ["Design", "Frontend", "Planning", "Backend"];

/**
 * 히어로 지표.
 *
 * 지원자 수는 화면에서 뺐다. 지원 전에 "지금 몇 명 지원했다"를 보여주면
 * 숫자가 적을 때는 인기 없어 보이고, 많을 때는 경쟁률로 읽혀 지원을 망설이게 한다.
 * 집계 자체는 그대로 살아 있다 — /api/stats가 계속 내려주고, 운영진은 노션에서 본다.
 */
export default function LiveStats({
  deadline,
  serverNow,
  partCount,
  months,
}: {
  /** 마감 시각(ISO). 남은 시간은 브라우저가 이 값으로 직접 센다. */
  deadline: string;
  /** 서버가 그린 시각. 없으면 마운트 전까지는 세지 않는다. */
  serverNow?: number;
  partCount: number;
  months: number;
}) {
  const now = useNow(serverNow);
  const left = now === null ? null : timeLeft(deadline, new Date(now));

  const stats: Stat[] = [
    {
      glyph: "<",
      value: left?.kind === "days" ? left.days : 0,
      suffix: "일",
      decimals: 0,
      label: "지원 마감까지",
      // 당일에는 날짜가 의미를 잃는다. 오늘 밤까지 몇 시간 남았는지를 보여준다.
      text: left?.kind === "today" ? formatTimeLeft(left) : undefined,
    },
    {
      // *는 이 픽셀 폰트에서 작고 위로 붙어 나와 옆 글리프들과 무게가 안 맞았다.
      // +는 가운데 정렬이라 <, # 과 나란히 놓았을 때 균형이 잡힌다.
      glyph: "+",
      value: partCount,
      suffix: "파트",
      decimals: 0,
      label: "함께할 파트",
      values: PART_NAMES,
    },
    { glyph: "#", value: months, suffix: "개월+", decimals: 0, label: "예상 기간" },
  ];

  return <Stats stats={stats} />;
}
