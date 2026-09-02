import { NextResponse } from "next/server";
import { adminPath } from "@/lib/admin-path";
import { ADMIN_COOKIE, issueSession, passwordMatches } from "@/lib/admin-session";
import { clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 운영자 잠금 해제.
 *
 * 이 경로는 proxy가 막는 /api/admin/* 바깥에 둔다. 문을 열려면 문고리는
 * 잡을 수 있어야 하기 때문이다. 대신 여기만 무차별 대입에 노출되므로
 * 한도를 따로, 그리고 좁게 건다.
 */

/** 15분에 5번 틀리면 그 아이피는 잠긴다. */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;

/**
 * 실패만 센다. 공용 rateLimit은 호출 자체를 세는데, 그러면 오타를 몇 번 낸 뒤
 * 올바른 키를 넣어도 잠긴다. 공격자에게 주어지는 시도 횟수는 어느 쪽이든 같으므로
 * 굳이 운영자만 불편할 이유가 없다.
 *
 * 서버리스에서는 인스턴스별로만 셈이 남는다. 실제 방어력은 키 길이에서 나온다
 * (openssl rand -base64 24 = 192비트). 이 셈은 잡음을 줄이는 용도다.
 */
const failures = new Map<string, number[]>();

function recentFailures(ip: string): number {
  const now = Date.now();
  const arr = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(ip, arr);
  return arr.length;
}

function recordFailure(ip: string): void {
  failures.set(ip, [...(failures.get(ip) ?? []), Date.now()]);
}

export async function POST(req: Request) {
  const secret = process.env.ADMIN_TOKEN?.trim() ?? "";
  const ip = clientIp(req);

  if (recentFailures(ip) >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "시도가 너무 많습니다. 15분 뒤에 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  let password = "";
  let from = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
    from = typeof body?.from === "string" ? body.from : "";
  } catch {
    // 본문이 깨졌어도 아래 실패 처리로 흘려보낸다. 형식 오류를 따로 알려줄 이유가 없다.
  }

  // 잠금 화면이 어느 주소에서 떴는지 함께 받는다. 비밀 경로를 모르면 이 엔드포인트가
  // 있는지조차 알 수 없다. 여기까지 감춰야 입구를 옮긴 의미가 있다.
  const entrance = adminPath();
  if (!entrance || from !== entrance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!passwordMatches(password, secret)) {
    recordFailure(ip);
    // 자동화된 시도를 조금이라도 느리게 만든다. 사람에게는 체감되지 않는다.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "키가 올바르지 않습니다." }, { status: 401 });
  }

  // 통과했으면 실패 기록을 지운다. 오타 뒤에 제대로 넣은 사람을 계속 붙잡지 않는다.
  failures.delete(ip);
  const { value, maxAge } = await issueSession(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

/** 로그아웃. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
