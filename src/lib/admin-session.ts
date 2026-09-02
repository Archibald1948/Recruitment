/**
 * 운영자 세션 쿠키.
 *
 * proxy(엣지)와 라우트 핸들러(노드) 양쪽에서 검증해야 해서 node:crypto가 아니라
 * Web Crypto를 쓴다. 엣지 런타임에는 node:crypto가 없다.
 *
 * 쿠키 값은 `<만료시각>.<서명>`이다. 서명 키는 ADMIN_TOKEN이므로, 쿠키를 위조하려면
 * 결국 비밀번호를 알아야 한다. 서버에 세션 저장소를 두지 않아도 되는 대신
 * 강제 만료는 못 시킨다 — 그럴 일이 생기면 ADMIN_TOKEN을 바꾸면 모든 세션이 끊긴다.
 */

export const ADMIN_COOKIE = "admin_session";

/** 세션 유효 시간. 길게 열어둘 이유가 없다. */
const TTL_MS = 8 * 60 * 60_000;

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
}

/** 길이가 달라도 이르게 빠져나오지 않도록, 두 문자열을 끝까지 훑어 비교한다. */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export async function issueSession(secret: string): Promise<{ value: string; maxAge: number }> {
  const exp = String(Date.now() + TTL_MS);
  return { value: `${exp}.${await sign(exp, secret)}`, maxAge: Math.floor(TTL_MS / 1000) };
}

export async function verifySession(cookie: string | undefined, secret: string): Promise<boolean> {
  if (!cookie || !secret) return false;

  const dot = cookie.lastIndexOf(".");
  if (dot <= 0) return false;

  const exp = cookie.slice(0, dot);
  const mac = cookie.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;

  return constantTimeEqual(mac, await sign(exp, secret));
}

/** 비밀번호 대조. 세션 발급 전에 쓴다. */
export function passwordMatches(given: string, secret: string): boolean {
  if (!secret) return false;
  return constantTimeEqual(given, secret);
}
