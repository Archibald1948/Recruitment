"use client";

import { useSyncExternalStore } from "react";

/**
 * 초 단위로 흐르는 현재 시각.
 *
 * 랜딩은 5분마다 다시 그려지는 캐시라, 서버가 계산한 남은 시간은 최대 5분
 * 묵고 흐르지도 않는다. 마감 당일처럼 분이 중요할 때는 브라우저가 직접 센다.
 *
 * 시계는 하나만 돌린다. 이 훅을 쓰는 곳이 여럿이어도 타이머는 하나다.
 */

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

function schedule() {
  // 초 경계에 맞춘다. 고정 간격으로 돌리면 조금씩 밀려 분이 늦게 넘어간다.
  timer = setTimeout(() => {
    listeners.forEach((listener) => listener());
    schedule();
  }, 1000 - (Date.now() % 1000));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) clearTimeout(timer);
  };
}

// 같은 초 안에서는 같은 값을 돌려줘야 한다. 매번 다르면 React가 끝없이 다시 그린다.
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;

/**
 * @param serverNow 서버가 그릴 때의 시각. 하이드레이션 중에는 이 값을 써서
 *   서버 HTML과 첫 화면이 어긋나지 않게 하고, 그 직후 실제 시각으로 넘어간다.
 *   넘기지 않으면 서버와 하이드레이션 동안은 null이다.
 */
export function useNow(serverNow?: number): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverNow ?? null);
}
