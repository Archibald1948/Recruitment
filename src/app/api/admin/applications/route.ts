import { NextResponse } from "next/server";
import { adminAuthorized } from "@/lib/admin";
import { listApplications } from "@/lib/notion";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 운영자 화면용 지원자 목록. */
export async function GET(req: Request) {
  // 토큰 무차별 대입을 막는다.
  if (!rateLimit(`admin:${clientIp(req)}`, 60)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  if (!adminAuthorized(req)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  try {
    const records = await listApplications();
    // 수정 토큰 해시는 어떤 경우에도 응답에 실리지 않는다.
    const items = records.map(({ tokenHash: _drop, ...rest }) => {
      void _drop;
      return rest;
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error("[admin] 목록 조회 실패:", e);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 500 });
  }
}
