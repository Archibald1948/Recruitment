import { NextResponse } from "next/server";
import { openSlotDays } from "@/lib/meeting-slots";
import { takenSlots } from "@/lib/notion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 지원 폼이 그릴 미팅 시간 후보.
 *
 * 찜한 시각만 내려준다. 누가 골랐는지는 담지 않는다 — 남의 지원 사실을
 * 알려줄 이유가 없다.
 *
 * 노션 API 한도(초당 3회) 때문에 짧게 캐시한다. 캐시가 살아 있는 동안 방금
 * 찬 칸이 열려 보일 수 있지만, 저장 직전에 서버가 다시 확인하므로 두 명이
 * 같은 칸에 들어가지는 않는다.
 */
const TTL = 20_000;
let cache: { at: number; taken: string[] } | null = null;

export async function GET() {
  let taken = cache && Date.now() - cache.at < TTL ? cache.taken : null;

  if (taken === null) {
    try {
      taken = await takenSlots();
      cache = { at: Date.now(), taken };
    } catch (e) {
      // 목록을 못 읽어도 폼은 떠야 한다. 최종 판단은 어차피 저장 시점에 한다.
      console.error("[slots] 조회 실패:", e);
      taken = cache?.taken ?? [];
    }
  }

  return NextResponse.json(
    { days: openSlotDays(), taken },
    { headers: { "Cache-Control": "no-store" } },
  );
}
