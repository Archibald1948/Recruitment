import { NextResponse } from "next/server";
import { adminAuthorized, stampKst } from "@/lib/admin";
import { sendStatusUpdate } from "@/lib/mail";
import { getApplication, markNotified } from "@/lib/notion";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { canonicalStatus } from "@/lib/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 심사 상태 안내 메일을 지금 보낸다.
 *
 * 노션 변경을 감지해 자동으로 보내지 않는다. 지원자에게 나가는 메일은
 * 되돌릴 수 없어서, 무엇이 나가는지 사람이 확인하고 누르는 편이 안전하다.
 */
export async function POST(req: Request) {
  if (!rateLimit(`admin:${clientIp(req)}`, 60)) {
    return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  if (!(await adminAuthorized(req))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const id = body.id?.trim();
  if (!id) return NextResponse.json({ error: "지원서를 지정해 주세요." }, { status: 400 });

  const record = await getApplication(id);
  if (!record) return NextResponse.json({ error: "지원서를 찾을 수 없습니다." }, { status: 404 });
  if (!record.email) {
    return NextResponse.json({ error: "이메일이 비어 있어 보낼 수 없습니다." }, { status: 422 });
  }

  const status = canonicalStatus(record.status);
  if (!status) {
    return NextResponse.json(
      { error: `노션의 상태값 "${record.status}"을 알 수 없습니다.` },
      { status: 422 },
    );
  }

  const mail = await sendStatusUpdate({
    to: record.email,
    name: record.name,
    position: record.position,
    status,
    meetingAt: record.meetingAt,
    zoomUrl: record.zoomUrl,
    notice: record.notice,
  });

  if (!mail.sent) {
    return NextResponse.json(
      { error: `발송 실패: ${mail.reason ?? "알 수 없는 이유"}` },
      { status: 502 },
    );
  }

  // 발송 기록은 실패해도 메일이 이미 나갔으므로 성공으로 응답한다.
  const log = `${stampKst()} · ${status} 안내 발송`;
  try {
    await markNotified(id, log);
  } catch (e) {
    console.error("[admin] 발송 기록 실패:", e);
  }

  return NextResponse.json({ sent: true, via: mail.via, log });
}
