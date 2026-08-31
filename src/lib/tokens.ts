import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

function pepper(): string {
  const p = process.env.TOKEN_PEPPER;
  if (!p) throw new Error("TOKEN_PEPPER 환경변수가 설정되지 않았습니다.");
  return p;
}

/** 지원자에게 메일로만 전달되는 수정 토큰 원문 */
export function createEditToken(): string {
  return randomBytes(32).toString("base64url");
}

/** 노션에는 이 해시만 저장한다. 원문은 절대 저장하지 않는다. */
export function hashEditToken(token: string): string {
  return createHash("sha256").update(`${token}${pepper()}`).digest("hex");
}

export function verifyEditToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false;
  const a = Buffer.from(hashEditToken(token), "utf8");
  const b = Buffer.from(storedHash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function editUrl(pageId: string, token: string): string {
  const base = appBaseUrl();
  return `${base}/apply/${pageId}?t=${encodeURIComponent(token)}`;
}

/**
 * 매직 링크의 기준 주소.
 *
 * APP_URL을 깜빡하면 지원자에게 localhost 주소가 담긴 메일이 나간다.
 * 배포 환경에서는 Vercel이 넣어주는 도메인으로 자동 대체한다.
 */
function appBaseUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  const isLocal = !explicit || /localhost|127\.0\.0\.1/.test(explicit);

  if (!isLocal) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return (explicit || "http://localhost:3000").replace(/\/$/, "");
}
