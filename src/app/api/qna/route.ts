import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createQuestion } from "@/lib/qna";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { validateQuestion } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = clientIp(req);

  // 지원서와 같은 2단 구조. 무차별 요청을 먼저 막고, 실제 등록 한도는
  // 검증을 통과한 뒤에 건다. 오타로 몇 번 막혔다고 글쓰기가 잠기면 안 된다.
  if (!rateLimit(`qna:burst:${ip}`, 30)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { ok, errors, value } = validateQuestion(raw);

  // 허니팟: 봇이면 성공한 것처럼 응답하고 아무것도 저장하지 않는다.
  if (value.company) return NextResponse.json({ posted: true }, { status: 200 });

  if (!ok) return NextResponse.json({ errors }, { status: 422 });

  if (!rateLimit(`qna:create:${ip}`, 5)) {
    return NextResponse.json(
      { error: "질문을 여러 개 남기셨습니다. 답변을 기다려 주세요." },
      { status: 429 },
    );
  }

  try {
    await createQuestion({ nickname: value.nickname, question: value.question });
  } catch (e) {
    console.error("[qna] 등록 실패:", e);
    return NextResponse.json(
      { error: "질문 등록에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }

  // 방금 쓴 글이 목록에 바로 보여야 한다. ISR 주기를 기다리지 않는다.
  revalidatePath("/qna");

  return NextResponse.json({ posted: true });
}
