import { NextResponse } from "next/server";
import { daysLeft, isClosed, openPositions } from "@/config/site";
import { countApplications } from "@/lib/notion";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 공개 지표. 노션 API는 평균 초당 3요청 제한이 있으므로 반드시 캐시한다.
 */
const TTL = 60_000;
let cache: { at: number; applicants: number } | null = null;

export async function GET() {
  let applicants = cache && Date.now() - cache.at < TTL ? cache.applicants : null;

  if (applicants === null) {
    try {
      applicants = await countApplications();
      cache = { at: Date.now(), applicants };
    } catch {
      // 노션 미연결이거나 실패해도 화면은 떠야 한다.
      applicants = cache?.applicants ?? 0;
    }
  }

  return NextResponse.json(
    {
      applicants,
      daysLeft: daysLeft(),
      closed: isClosed(),
      openPositions: openPositions.length,
    },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
