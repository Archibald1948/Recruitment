"use client";

import { formatTimeLeft, timeLeft } from "@/config/site";
import { useNow } from "@/lib/useNow";

/**
 * "마감까지 3일" · "마감까지 3시간 29분" · "모집 마감"
 *
 * 마감 당일에는 분 단위로 줄어든다. 페이지 캐시와 무관하게 브라우저 시계로 센다.
 */
export default function DeadlineChip({
  deadline,
  serverNow,
  className,
}: {
  deadline: string;
  serverNow: number;
  className?: string;
}) {
  const left = timeLeft(deadline, new Date(useNow(serverNow) ?? serverNow));
  return (
    <span className={className}>
      {left.kind === "closed" ? "모집 마감" : `마감까지 ${formatTimeLeft(left)}`}
    </span>
  );
}
