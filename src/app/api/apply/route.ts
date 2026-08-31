import { NextResponse } from "next/server";
import { isClosed, positionById } from "@/config/site";
import { createApplication, findByEmail } from "@/lib/notion";
import { sendApplicationReceipt } from "@/lib/mail";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { createEditToken, editUrl, hashEditToken } from "@/lib/tokens";
import { validateApplication } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (isClosed()) {
    return NextResponse.json({ error: "모집이 마감되었습니다." }, { status: 410 });
  }

  const ip = clientIp(req);

  // 한도는 두 단계로 나눈다.
  // 유효성 실패까지 엄격한 한도에 넣으면 오타를 몇 번 낸 지원자가 잠겨버린다.
  // 여기서는 무차별 요청만 막고, 실제 접수 한도는 검증을 통과한 뒤에 건다.
  if (!rateLimit(`apply:burst:${ip}`, 40)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { ok, errors, value } = validateApplication(raw);

  // 허니팟: 봇이면 성공한 것처럼 응답하고 아무것도 저장하지 않는다.
  if (value.company) return NextResponse.json({ id: "ok" }, { status: 201 });

  if (!ok) return NextResponse.json({ errors }, { status: 422 });

  // 검증을 통과한 요청만 실제 접수 한도를 소모한다.
  if (!rateLimit(`apply:create:${ip}`, 5)) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해 주세요. 이미 접수되었을 수 있으니 메일을 확인해 주세요." },
      { status: 429 },
    );
  }

  try {
    const existing = await findByEmail(value.email);
    if (existing) {
      return NextResponse.json(
        {
          error:
            "이미 이 이메일로 접수된 지원서가 있습니다. 메일로 보내드린 링크에서 수정해 주세요.",
        },
        { status: 409 },
      );
    }

    const token = createEditToken();
    const page = await createApplication(value, hashEditToken(token));
    const url = editUrl(page.id, token);

    const mail = await sendApplicationReceipt({
      to: value.email,
      name: value.name,
      position: positionById(value.position)?.title ?? value.position,
      editUrl: url,
    });

    return NextResponse.json({ id: page.id, editUrl: url, mailed: mail.sent }, { status: 201 });
  } catch (e) {
    console.error("[apply] 접수 실패:", e);
    return NextResponse.json(
      { error: "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
