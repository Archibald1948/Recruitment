import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { validateContact } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);

  // 지원서와 마찬가지로 무차별 요청만 먼저 막고, 실제 발송 한도는 검증 뒤에 건다.
  if (!rateLimit(`contact:burst:${ip}`, 30)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { ok, errors, value } = validateContact(raw);

  // 허니팟: 봇이면 성공한 것처럼 응답하고 아무것도 보내지 않는다.
  if (value.company) return NextResponse.json({ sent: true }, { status: 200 });

  if (!ok) return NextResponse.json({ errors }, { status: 422 });

  if (!rateLimit(`contact:send:${ip}`, 3)) {
    return NextResponse.json(
      { error: "문의를 이미 보내셨습니다. 답장을 기다려 주세요." },
      { status: 429 },
    );
  }

  const result = await sendContactMessage(value);
  if (!result.sent) {
    console.error("[contact] 발송 실패:", result.reason);
    return NextResponse.json(
      { error: "문의 전송에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  return NextResponse.json({ sent: true });
}
