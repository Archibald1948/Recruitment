"use client";

import { useEffect, useState } from "react";
import Stats, { type Stat } from "./Stats";

export default function LiveStats({
  remaining,
  partCount,
  months,
}: {
  remaining: number;
  partCount: number;
  months: number;
}) {
  const [applicants, setApplicants] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.applicants === "number") setApplicants(d.applicants);
      })
      .catch(() => {
        /* 지표는 부가 정보라 실패해도 화면을 막지 않는다 */
      });
    return () => {
      alive = false;
    };
  }, []);

  const stats: Stat[] = [
    { glyph: "<", value: remaining, suffix: "일", decimals: 0, label: "지원 마감까지" },
    { glyph: "%", value: applicants, suffix: "명", decimals: 0, label: "현재 지원자" },
    {
      // *는 이 픽셀 폰트에서 작고 위로 붙어 나와 옆 글리프들과 무게가 안 맞았다.
      // +는 가운데 정렬이라 <, %, # 과 나란히 놓았을 때 균형이 잡힌다.
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
