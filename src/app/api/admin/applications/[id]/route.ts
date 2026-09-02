import { NextResponse } from "next/server";
import { adminAuthorized } from "@/lib/admin";
import { getApplication, updateReview } from "@/lib/notion";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { STATUS_FLOW } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const MAX_NOTICE = 1500;

/**
 * 심사 항목 저장.
 *
 * 노션을 열지 않고 운영자 화면에서 바로 고칠 수 있게 한다. 노션은 저장소로만
 * 남고, 판단과 입력은 한 화면에서 끝난다.
 *
 * 지원자가 쓴 값(이름·이메일·지원 내용)은 건드리지 않는다. 운영자가 실수로
 * 지원서를 고쳐버리는 길을 아예 만들지 않는다.
 */
export async function PATCH(req: Request, ctx: Ctx) {
  if (!rateLimit(`admin:${clientIp(req)}`, 60)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  if (!(await adminAuthorized(req))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  const { id } = await ctx.params;

  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const status = str(raw.status);
  const zoomUrl = str(raw.zoomUrl);
  const notice = str(raw.notice);
  const meetingAt = raw.meetingAt === null ? null : str(raw.meetingAt) || null;

  // 노션 셀렉트에 없는 이름을 보내면 옵션이 새로 생겨버린다. 아는 값만 받는다.
  if (status && !STATUS_FLOW.includes(status as (typeof STATUS_FLOW)[number])) {
    return NextResponse.json({ error: "알 수 없는 상태입니다." }, { status: 422 });
  }
  if (zoomUrl && !/^https?:\/\//i.test(zoomUrl)) {
    return NextResponse.json(
      { error: "미팅 링크는 http:// 또는 https:// 로 시작해야 합니다." },
      { status: 422 },
    );
  }
  if (meetingAt && Number.isNaN(new Date(meetingAt).getTime())) {
    return NextResponse.json({ error: "미팅 일시를 확인해 주세요." }, { status: 422 });
  }
  if (notice.length > MAX_NOTICE) {
    return NextResponse.json(
      { error: `안내 메시지는 ${MAX_NOTICE}자 이내로 적어주세요.` },
      { status: 422 },
    );
  }

  const record = await getApplication(id);
  if (!record) return NextResponse.json({ error: "지원서를 찾을 수 없습니다." }, { status: 404 });

  try {
    await updateReview(id, { status, meetingAt, zoomUrl, notice });
  } catch (e) {
    console.error("[admin] 저장 실패:", e);
    return NextResponse.json({ error: "저장에 실패했습니다." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, status, meetingAt, zoomUrl, notice });
}
