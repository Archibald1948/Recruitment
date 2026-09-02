import nodemailer from "nodemailer";
import { Resend } from "resend";
import { site } from "@/config/site";

/**
 * 접수 확인 메일.
 *
 * 발송 수단은 두 가지를 지원하고, 설정된 것을 자동으로 고른다.
 *
 *   1) Gmail SMTP  — 도메인이 필요 없다. 앱 비밀번호만 있으면 바로 보낼 수 있다
 *   2) Resend      — 도메인을 확보한 뒤 갈아끼운다. 발신 평판과 도달률이 더 좋다
 *
 * 둘 다 없으면 콘솔에 수정 링크만 남기고 조용히 넘어간다.
 * 메일 발송 실패가 접수 자체를 되돌리지는 않는다.
 */

export type MailProvider = "gmail" | "resend" | "none";

export function activeProvider(): MailProvider {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return "gmail";
  return "none";
}

let resend: Resend | null = null;
let smtp: nodemailer.Transporter | null = null;

function resendClient(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function smtpClient(): nodemailer.Transporter {
  if (!smtp) {
    smtp = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        // 계정 비밀번호가 아니라 앱 비밀번호다. 2단계 인증이 켜져 있어야 발급된다.
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return smtp;
}

/**
 * 발신자 표기.
 * Gmail은 인증된 계정 주소로만 보낼 수 있어서 표시 이름만 붙인다.
 */
function from(): string {
  const label = process.env.MAIL_FROM_NAME || site.name;
  if (activeProvider() === "gmail") return `"${label}" <${process.env.GMAIL_USER}>`;
  return process.env.MAIL_FROM || `"${label}" <onboarding@resend.dev>`;
}

const shell = (title: string, body: string) => `
<div style="background:#0c0c0c;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid rgba(215,226,234,.15);border-radius:20px;padding:32px">
    <h1 style="margin:0 0 20px;font-size:19px;line-height:1.4;color:#fff">${title}</h1>
    <div style="font-size:14px;line-height:1.75;color:#d7e2ea">${body}</div>
    <hr style="border:0;border-top:1px solid rgba(215,226,234,.15);margin:28px 0 16px" />
    <p style="margin:0;font-size:12px;line-height:1.6;color:#8e8e8e">
      이 메일은 지원서 접수 시 자동 발송됩니다.<br />
      ${site.privacyNotice}
    </p>
  </div>
</div>`;

/** 접수 확인 + 수정 링크. 발송 실패가 접수 자체를 되돌리지는 않는다. */
/**
 * 팀장 주소. 저장소가 공개라 코드에 박지 않고 환경변수로만 둔다.
 * 지원자가 접수 메일에 답장하면 이 주소로 가고, 문의 메일도 여기로 간다.
 */
function teamEmail(): string | undefined {
  return process.env.CONTACT_EMAIL?.trim() || undefined;
}

export async function sendApplicationReceipt(opts: {
  to: string;
  name: string;
  position: string;
  editUrl: string;
}): Promise<{ sent: boolean; via: MailProvider; reason?: string }> {
  const provider = activeProvider();

  if (provider === "none") {
    // 로컬 개발에선 콘솔로 링크를 확인한다.
    console.warn("[mail] 발송 수단 미설정 — 수정 링크:", opts.editUrl);
    return { sent: false, via: "none", reason: "발송 수단 미설정" };
  }

  const subject = "[팀 프로젝트] 지원이 접수되었습니다";
  const html = shell(
    `${opts.name}님, 지원이 정상적으로 접수되었습니다.`,
    `
    <p style="margin:0 0 16px">지원 포지션: <strong style="color:#fff">${opts.position}</strong></p>
    <p style="margin:0 0 16px">
      아래 링크에서 <strong style="color:#fff">지원 내용을 다시 확인하고 수정</strong>할 수 있고,
      현재 심사 상태도 볼 수 있습니다. 이 링크는 본인만 접근할 수 있으니 공유하지 말아주세요.
    </p>
    <p style="margin:0">
      <a href="${opts.editUrl}"
         style="display:inline-block;background:#fff;color:#0c0c0c;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px">
        내 지원서 확인하기
      </a>
    </p>`,
  );

  // HTML을 막는 클라이언트에서는 버튼이 보이지 않으므로 텍스트 파트에는 주소를 남긴다.
  const text = [
    `${opts.name}님, 지원이 정상적으로 접수되었습니다.`,
    ``,
    `지원 포지션: ${opts.position}`,
    ``,
    `아래 링크에서 지원 내용을 확인·수정하고 심사 상태를 볼 수 있습니다.`,
    `이 링크는 본인만 접근할 수 있으니 공유하지 말아주세요.`,
    ``,
    opts.editUrl,
  ].join("\n");

  try {
    if (provider === "gmail") {
      await smtpClient().sendMail({
        from: from(),
        to: opts.to,
        replyTo: teamEmail(),
        subject,
        html,
        text,
      });
      return { sent: true, via: "gmail" };
    }

    const { error } = await resendClient().emails.send({
      from: from(),
      to: opts.to,
      replyTo: teamEmail(),
      subject,
      html,
      text,
    });
    if (error) return { sent: false, via: "resend", reason: error.message };
    return { sent: true, via: "resend" };
  } catch (e) {
    return {
      sent: false,
      via: provider,
      reason: e instanceof Error ? e.message : "발송 실패",
    };
  }
}

/**
 * 문의 메일. 지원 전에 궁금한 점을 팀장에게 바로 전달한다.
 * 답장이 문의한 사람에게 바로 가도록 replyTo에 문의자 주소를 넣는다.
 */
export async function sendContactMessage(opts: {
  name: string;
  email: string;
  message: string;
}): Promise<{ sent: boolean; via: MailProvider; reason?: string }> {
  const provider = activeProvider();
  const to = teamEmail();

  if (!to) return { sent: false, via: provider, reason: "CONTACT_EMAIL 미설정" };
  if (provider === "none") {
    console.warn("[mail] 발송 수단 미설정 — 문의 내용:", opts.name, opts.email);
    return { sent: false, via: "none", reason: "발송 수단 미설정" };
  }

  const subject = `[모집 사이트 문의] ${opts.name}님`;
  const html = shell(
    `${opts.name}님이 문의를 남겼습니다.`,
    `
    <p style="margin:0 0 8px">보낸 사람: <strong style="color:#fff">${opts.name}</strong></p>
    <p style="margin:0 0 20px">회신 주소: <a href="mailto:${opts.email}" style="color:#fff">${opts.email}</a></p>
    <div style="white-space:pre-wrap;border-left:2px solid rgba(215,226,234,.25);padding-left:14px">${opts.message}</div>`,
  );
  const text = [
    `${opts.name}님이 문의를 남겼습니다.`,
    ``,
    `회신 주소: ${opts.email}`,
    ``,
    opts.message,
  ].join("\n");

  try {
    if (provider === "gmail") {
      await smtpClient().sendMail({ from: from(), to, replyTo: opts.email, subject, html, text });
      return { sent: true, via: "gmail" };
    }
    const { error } = await resendClient().emails.send({
      from: from(),
      to,
      replyTo: opts.email,
      subject,
      html,
      text,
    });
    if (error) return { sent: false, via: "resend", reason: error.message };
    return { sent: true, via: "resend" };
  } catch (e) {
    return { sent: false, via: provider, reason: e instanceof Error ? e.message : "발송 실패" };
  }
}
