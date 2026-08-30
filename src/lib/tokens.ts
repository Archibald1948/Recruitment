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
  const base = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/apply/${pageId}?t=${encodeURIComponent(token)}`;
}
