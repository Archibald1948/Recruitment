import { Resend } from "resend";
import { site } from "@/config/site";

let resend: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

const from = () => process.env.MAIL_FROM || "onboarding@resend.dev";

const shell = (title: string, body: string) => `
<div style="background:#0c0c0c;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid rgba(215,226,234,.15);border-radius:20px;padding:32px">
    <h1 style="margin:0 0 20px;font-size:19px;line-height:1.4;color:#fff">${title}</h1>
    <div style="font-size:14px;line-height:1.75;color:#d7e2ea">${body}</div>
    <hr style="border:0;border-top:1px solid rgba(215,226,234,.15);margin:28px 0 16px" />
    <p style="margin:0;font-size:12px;line-height:1.6;color:#8e8e8e">
      이 메일은 지원서 접수 시 자동 발송됩니다.<br />
      수집한 개인정보는 ${site.privacyRetention} 후 파기됩니다.
    </p>
  </div>
</div>`;

/** 접수 확인 + 수정 링크. 메일 발송 실패가 접수 자체를 되돌리지는 않는다. */
export async function sendApplicationReceipt(opts: {
  to: string;
  name: string;
  position: string;
  editUrl: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const c = client();
  if (!c) {
    // 로컬 개발에선 콘솔로 링크를 확인한다.
    console.warn("[mail] RESEND_API_KEY 미설정 — 수정 링크:", opts.editUrl);
    return { sent: false, reason: "RESEND_API_KEY 미설정" };
  }

  const html = shell(
    `${opts.name}님, 지원이 정상적으로 접수되었습니다.`,
    `
    <p style="margin:0 0 16px">지원 포지션: <strong style="color:#fff">${opts.position}</strong></p>
    <p style="margin:0 0 16px">
      아래 링크에서 <strong style="color:#fff">지원 내용을 다시 확인하고 수정</strong>할 수 있고,
      현재 심사 상태도 볼 수 있습니다. 이 링크는 본인만 접근할 수 있으니 공유하지 말아주세요.
    </p>
    <p style="margin:0 0 24px">
      <a href="${opts.editUrl}"
         style="display:inline-block;background:#fff;color:#0c0c0c;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px">
        내 지원서 확인하기
      </a>
    </p>
    <p style="margin:0;font-size:13px;color:#8e8e8e">
      링크가 열리지 않으면 아래 주소를 복사해 주소창에 붙여넣어 주세요.<br />
      <span style="word-break:break-all">${opts.editUrl}</span>
    </p>`,
  );

  try {
    const { error } = await c.emails.send({
      from: from(),
      to: opts.to,
      subject: "[팀 프로젝트] 지원이 접수되었습니다",
      html,
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "발송 실패" };
  }
}
