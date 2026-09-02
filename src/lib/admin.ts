import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, verifySession } from "./admin-session";

/**
 * 운영자 인증.
 *
 * 지원자 개인정보를 읽고 메일을 보내는 경로라 URL을 숨기는 것만으로는 부족하다.
 * 계정 체계를 새로 만들 규모는 아니므로 공유 시크릿 하나로 막는다.
 *
 * 앞단의 proxy가 이미 세션 없는 요청을 404로 돌려보내지만, 여기서 한 번 더
 * 본다. proxy 설정이 어긋나는 날에도 지원자 목록이 열리면 안 된다.
 *
 * 두 가지를 인정한다.
 *  - 세션 쿠키: 브라우저에서 잠금을 푼 경우
 *  - x-admin-token 헤더: 스크립트에서 부르는 경우
 *
 * ADMIN_TOKEN이 설정되지 않으면 열어두지 않고 **잠근다.** 환경변수를 깜빡한
 * 배포에서 지원자 목록이 그대로 열리는 쪽이 훨씬 위험하다.
 */
export async function adminAuthorized(req: Request): Promise<boolean> {
  const expected = process.env.ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const cookie = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  if (await verifySession(cookie, expected)) return true;

  const given = req.headers.get("x-admin-token")?.trim() ?? "";
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** 한국 시간 기준 "2026-09-02 19:40" */
export function stampKst(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return parts.replace("T", " ");
}
