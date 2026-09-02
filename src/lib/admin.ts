import { timingSafeEqual } from "node:crypto";

/**
 * 운영자 인증.
 *
 * 지원자 개인정보를 읽고 메일을 보내는 경로라 URL을 숨기는 것만으로는 부족하다.
 * 계정 체계를 새로 만들 규모는 아니므로 공유 시크릿 하나로 막는다.
 *
 * ADMIN_TOKEN이 설정되지 않으면 열어두지 않고 **잠근다.** 환경변수를 깜빡한
 * 배포에서 지원자 목록이 그대로 열리는 쪽이 훨씬 위험하다.
 */
export function adminAuthorized(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN?.trim();
  if (!expected) return false;

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
