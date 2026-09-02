import { NextResponse, type NextRequest } from "next/server";
import { adminPath } from "@/lib/admin-path";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session";

/**
 * 운영자 경로 앞에 세우는 문지기.
 *
 * 두 가지를 한다.
 *  1. 입구를 숨긴다 — 실제 화면은 /admin에 있지만 그 주소로는 절대 열리지 않는다.
 *     ADMIN_PATH에 적어둔 비밀 경로로 들어와야 하고, 그 값은 저장소에 없다.
 *  2. 잠근다 — 비밀 경로를 알아도 세션이 없으면 잠금 화면까지만이다.
 *
 * 막을 때는 401이 아니라 **404**를 준다. 401은 "여기 뭔가 있다"를 알려주는
 * 셈이라, 훑고 다니는 쪽에 굳이 힌트를 줄 이유가 없다.
 */

/** 없는 경로로 넘겨 앱의 not-found를 그대로 그린다. 다른 404와 구분되지 않는다. */
function notFound(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/_missing";
  url.search = "";
  return NextResponse.rewrite(url, { status: 404 });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secret = adminPath();

  const isAdminApi = pathname.startsWith("/api/admin/");
  const isInternal = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/admin-gate";
  const isEntrance = secret !== null && pathname === secret;

  // 운영자와 무관한 경로는 그대로 흘려보낸다.
  if (!isAdminApi && !isInternal && !isEntrance) return NextResponse.next();

  // 파일이 놓인 자리로 직접 들어오는 것은 언제나 막는다. 입구는 비밀 경로뿐이다.
  if (isInternal) return notFound(req);

  const authorized = await verifySession(
    req.cookies.get(ADMIN_COOKIE)?.value,
    process.env.ADMIN_TOKEN?.trim() ?? "",
  );

  if (isAdminApi) {
    return authorized
      ? NextResponse.next()
      : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 비밀 경로: 통과했으면 운영자 화면, 아니면 잠금 화면. 주소는 그대로 유지된다.
  const url = req.nextUrl.clone();
  url.pathname = authorized ? "/admin" : "/admin-gate";
  url.search = "";
  return NextResponse.rewrite(url, authorized ? undefined : { status: 404 });
}

export const config = {
  /*
   * 비밀 경로는 환경변수라 matcher에 적을 수 없다(matcher 값은 빌드 시점에
   * 정적으로 읽힌다). 그래서 정적 자산만 제외하고 전부 통과시킨 뒤,
   * 운영자와 무관한 경로는 함수 첫머리에서 곧바로 돌려보낸다.
   */
  matcher: ["/((?!_next/static|_next/image|favicon|.*\\.[^/]+$).*)"],
};
