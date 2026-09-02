import { NextResponse } from "next/server";
import { getApplication } from "@/lib/notion";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { verifyJoinToken } from "@/lib/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * 미팅 입장.
 *
 * 줌 링크는 오래 살아남지 않는다. 회의를 다시 만들거나 일정을 옮기면 주소가
 * 바뀌고, 이미 보낸 메일에 그 주소가 박혀 있으면 지원자는 죽은 링크를 받는다.
 * 메일이 만들어진 시점의 사실을 그대로 얼려버리기 때문이다.
 *
 * 그래서 메일에는 이 주소를 싣는다. 눌린 순간 노션의 지금 값을 읽어 넘긴다.
 * 운영진이 링크를 바꾸면 이미 보낸 메일도 따라 바뀐다.
 *
 * 링크가 아직 없거나 지워졌으면 지원자 조회 화면으로 보낸다. 죽은 줌 주소로
 * 떨어뜨리는 것보다 "아직 준비 중"을 보여주는 편이 낫다.
 */
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");
  const base = new URL(req.url).origin;
  // 입장 토큰은 수정 토큰이 아니다. 되돌려 보낼 때 t를 달아주면 안 된다.
  const fallback = `${base}/apply/${id}`;

  // 토큰을 훑는 시도를 막는다. 정상 사용자는 몇 번 누르지 않는다.
  if (!rateLimit(`join:${clientIp(req)}`, 30)) {
    return NextResponse.redirect(fallback, 302);
  }

  if (!token) return NextResponse.redirect(`${base}/apply/${id}`, 302);

  if (!verifyJoinToken(id, token)) return NextResponse.redirect(`${base}/apply/${id}`, 302);

  const record = await getApplication(id);
  if (!record) return NextResponse.redirect(`${base}/apply/${id}`, 302);

  const url = record.zoomUrl?.trim();
  if (!url || !/^https?:\/\//i.test(url)) return NextResponse.redirect(fallback, 302);

  // 캐시에 남으면 링크를 바꿔도 예전 곳으로 간다.
  return NextResponse.redirect(url, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
