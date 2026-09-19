"use client";

import {
  formatTimeLeft,
  openPositions,
  recruitCount,
  timeLeft,
  type TimeLeft,
} from "@/config/site";
import { useNow } from "@/lib/useNow";
import Stats, { type Stat } from "./Stats";

// 지금 뽑는 파트만 돌린다. 마감된 파트까지 돌리면 무엇을 뽑는지가 흐려진다.
// 컴포넌트 밖에 둔다. 시계가 매초 다시 그리는데, 배열을 안에서 새로 만들면
// 타자기 효과가 매초 처음부터 다시 시작한다.
const PART_NAMES = openPositions.map((p) => p.short);
const RECRUIT_COUNT = recruitCount();

/**
 * 첫 번째 지표. 마감일이 있으면 남은 시간을, 상시 모집이면 모집 인원을 보여준다.
 * 상시 모집에 카운트다운을 걸어두면 "0일"처럼 끝난 것으로 읽힌다.
 */
function leadStat(left: TimeLeft | null): Stat {
  if (left?.kind === "rolling") {
    return RECRUIT_COUNT === null
      ? { glyph: "<", value: 0, suffix: "", decimals: 0, label: "모집 중", text: "상시" }
      : { glyph: "<", value: RECRUIT_COUNT, suffix: "명", decimals: 0, label: "모집 인원" };
  }
  return {
    glyph: "<",
    value: left?.kind === "days" ? left.days : 0,
    suffix: "일",
    decimals: 0,
    label: "지원 마감까지",
    // 당일에는 날짜가 의미를 잃는다. 오늘 밤까지 몇 시간 남았는지를 보여준다.
    text: left?.kind === "today" ? formatTimeLeft(left) : undefined,
  };
}

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
  months,
}: {
  /** 마감 시각(ISO). null이면 상시 모집. 남은 시간은 브라우저가 이 값으로 직접 센다. */
  deadline: string | null;
  /** 서버가 그린 시각. 없으면 마운트 전까지는 세지 않는다. */
  serverNow?: number;
  months: number;
}) {
  const now = useNow(serverNow);
  // 상시 모집은 시각과 무관하다. 서버 시각이 없어도 처음부터 맞게 그린다.
  const left: TimeLeft | null =
    deadline === null
      ? { kind: "rolling" }
      : now === null
        ? null
        : timeLeft(deadline, new Date(now));

  const stats: Stat[] = [
    leadStat(left),
    {
      // *는 이 픽셀 폰트에서 작고 위로 붙어 나와 옆 글리프들과 무게가 안 맞았다.
      // +는 가운데 정렬이라 <, # 과 나란히 놓았을 때 균형이 잡힌다.
      glyph: "+",
      value: PART_NAMES.length,
      suffix: "파트",
      decimals: 0,
      label: "모집 파트",
      // 몇 개인지보다 어떤 파트인지가 중요해 이름을 순서대로 돌린다.
      values: PART_NAMES,
    },
    { glyph: "#", value: months, suffix: "개월+", decimals: 0, label: "예상 기간" },
  ];

  return <Stats stats={stats} />;
}
