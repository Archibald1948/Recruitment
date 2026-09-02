import { NextResponse } from "next/server";
import { isClosed, positionById, positions } from "@/config/site";
import { getDeadline } from "@/lib/settings";
import { appendHistory, getApplication, updateApplication } from "@/lib/notion";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { verifyEditToken } from "@/lib/tokens";
import { validateApplication } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** 토큰이 맞는 지원서만 돌려준다. 토큰 해시는 절대 응답에 넣지 않는다. */
async function authorize(id: string, token: string | null) {
  if (!token) return { error: "링크가 올바르지 않습니다.", status: 401 as const };
  const record = await getApplication(id);
  if (!record) return { error: "지원서를 찾을 수 없습니다.", status: 404 as const };
  if (!verifyEditToken(token, record.tokenHash))
    return { error: "링크가 만료되었거나 올바르지 않습니다.", status: 403 as const };
  return { record };
}

function present(
  record: NonNullable<Awaited<ReturnType<typeof getApplication>>>,
  deadline: string,
) {
  const { tokenHash: _drop, ...safe } = record;
  void _drop;
  const position = positions.find((p) => p.title === safe.position);
  return { ...safe, positionId: position?.id ?? "", editable: !isClosed(deadline) };
}

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const token = new URL(req.url).searchParams.get("t");

  const auth = await authorize(id, token);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  return NextResponse.json(present(auth.record, await getDeadline()));
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!rateLimit(`patch:${clientIp(req)}`, 15)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const auth = await authorize(id, typeof raw.token === "string" ? raw.token : null);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (isClosed(await getDeadline())) {
    return NextResponse.json(
      { error: "모집이 마감되어 더 이상 수정할 수 없습니다." },
      { status: 423 },
    );
  }

  // 이메일은 계정 키라 기존 값을 강제한다.
  const { ok, errors, value } = validateApplication({ ...raw, email: auth.record.email });
  if (!ok) return NextResponse.json({ errors }, { status: 422 });

  try {
    await updateApplication(id, value);

    const stamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
    await appendHistory(
      id,
      `${stamp} · 지원자가 지원서를 수정했습니다 (포지션: ${positionById(value.position)?.title ?? value.position})`,
    );

    const updated = await getApplication(id);
    return NextResponse.json(updated ? present(updated, await getDeadline()) : { ok: true });
  } catch (e) {
    console.error("[applications] 수정 실패:", e);
    return NextResponse.json({ error: "수정 중 문제가 발생했습니다." }, { status: 500 });
  }
}
