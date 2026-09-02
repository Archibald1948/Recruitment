import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";

/**
 * 운영자 경로 앞에 세우는 문지기.
 *
 * 여기를 통과하지 못하면 /admin 화면도, /api/admin/* 도 아예 렌더되지 않는다.
 * 지원자 개인정보를 다루는 곳이라 "URL을 모르면 안전하다"에 기대지 않는다.
 *
 * 실패했을 때 401이 아니라 **404**를 준다. 401은 "여기 뭔가 있다"를 알려주는
 * 셈이라, 훑고 다니는 쪽에 굳이 힌트를 줄 이유가 없다.
 *
 * ADMIN_TOKEN이 없으면 통과 자체가 불가능하다. 환경변수를 깜빡한 배포에서
 * 지원자 목록이 열리는 쪽이 훨씬 위험하다.
 */
export async function proxy(req: NextRequest) {
  const secret = process.env.ADMIN_TOKEN?.trim() ?? "";
  const ok = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, secret);
  if (ok) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // API는 흔적 없이 404. 화면은 주소를 유지한 채 잠금 화면으로 바꿔 그린다.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/admin-gate";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
