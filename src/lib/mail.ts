import nodemailer from "nodemailer";
import { Resend } from "resend";
import { site } from "@/config/site";
import { formatMeetingAt } from "./format";

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

const shell = (
  title: string,
  body: string,
  note = "이 메일은 지원서 접수 시 자동 발송됩니다.",
) => `
<div style="background:#0c0c0c;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid rgba(215,226,234,.15);border-radius:20px;padding:32px">
    <h1 style="margin:0 0 20px;font-size:19px;line-height:1.4;color:#fff">${title}</h1>
    <div style="font-size:14px;line-height:1.75;color:#d7e2ea">${body}</div>
    <hr style="border:0;border-top:1px solid rgba(215,226,234,.15);margin:28px 0 16px" />
    <p style="margin:0;font-size:12px;line-height:1.6;color:#8e8e8e">
      ${note}<br />
      ${site.privacyNotice}
    </p>
  </div>
</div>`;

export interface SendResult {
  sent: boolean;
  via: MailProvider;
  reason?: string;
}

/** 실제 발송. 제공자 분기가 메일 종류마다 반복되지 않게 여기 한 곳에 둔다. */
async function deliver(
  to: string,
  subject: string,
  html: string,
  text: string,
): Promise<SendResult> {
  const provider = activeProvider();

  try {
    if (provider === "gmail") {
      await smtpClient().sendMail({ from: from(), to, subject, html, text });
      return { sent: true, via: "gmail" };
    }

    const { error } = await resendClient().emails.send({ from: from(), to, subject, html, text });
    if (error) return { sent: false, via: "resend", reason: error.message };
    return { sent: true, via: "resend" };
  } catch (e) {
    return { sent: false, via: provider, reason: e instanceof Error ? e.message : "발송 실패" };
  }
}

/** 접수 확인 + 수정 링크. 발송 실패가 접수 자체를 되돌리지는 않는다. */
export async function sendApplicationReceipt(opts: {
  to: string;
  name: string;
  position: string;
  editUrl: string;
}): Promise<SendResult> {
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

  return deliver(opts.to, subject, html, text);
}

/* ── 상태 안내 메일 ────────────────────────────────────────── */

/** 운영진이 노션에 적은 문구가 그대로 HTML에 들어가므로 반드시 이스케이프한다. */
function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 줄바꿈을 살린 본문 문단 */
const paragraphs = (v: string) =>
  esc(v)
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px">${block.replace(/\n/g, "<br />")}</p>`)
    .join("");

/** 상태별 제목과 첫 문장. 문구가 코드 곳곳에 흩어지지 않게 여기 모은다. */
const STATUS_COPY: Record<string, { subject: string; lead: (name: string) => string }> = {
  "서류 검토": {
    subject: "[팀 프로젝트] 서류 검토가 시작되었습니다",
    lead: (n) => `${n}님, 제출해 주신 지원서를 검토하고 있습니다.`,
  },
  "줌 미팅": {
    subject: "[팀 프로젝트] 줌 미팅 안내",
    lead: (n) => `${n}님, 서류 검토를 통과하셨습니다. 줌 미팅 일정을 안내드립니다.`,
  },
  합류: {
    subject: "[팀 프로젝트] 합류 안내",
    lead: (n) => `${n}님, 함께하게 되어 반갑습니다. 합류가 확정되었습니다.`,
  },
  불합격: {
    subject: "[팀 프로젝트] 지원 결과 안내",
    lead: (n) =>
      `${n}님, 지원해 주셔서 감사합니다. 아쉽게도 이번에는 함께하지 못하게 되었습니다.`,
  },
  접수됨: {
    subject: "[팀 프로젝트] 지원 진행 상황 안내",
    lead: (n) => `${n}님, 지원 진행 상황을 안내드립니다.`,
  },
};

/**
 * 심사 상태 안내 메일.
 *
 * 운영진이 운영자 화면에서 직접 눌러 보낸다. 노션 상태를 바꾼다고 저절로
 * 나가지 않는다 — 언제 무엇이 나가는지 사람이 확인하고 보내는 편이 안전하다.
 */
export async function sendStatusUpdate(opts: {
  to: string;
  name: string;
  position: string;
  status: string;
  meetingAt?: string;
  /**
   * 줌 주소가 아니라 우리 쪽 입장 링크다. 줌 주소를 메일에 박으면 회의를 다시
   * 만들거나 일정을 옮겼을 때 지원자가 죽은 링크를 받는다.
   */
  joinUrl?: string;
  notice?: string;
}): Promise<SendResult> {
  if (activeProvider() === "none") {
    console.warn("[mail] 발송 수단 미설정 — 안내 메일을 보내지 못했습니다:", opts.to);
    return { sent: false, via: "none", reason: "발송 수단 미설정" };
  }

  const copy = STATUS_COPY[opts.status] ?? STATUS_COPY["접수됨"];
  const when = opts.meetingAt ? formatMeetingAt(opts.meetingAt) : "";

  const rows = [
    `<p style="margin:0 0 16px">지원 포지션: <strong style="color:#fff">${esc(opts.position)}</strong></p>`,
    when
      ? `<p style="margin:0 0 16px">일시: <strong style="color:#fff">${esc(when)}</strong></p>`
      : "",
    opts.notice ? paragraphs(opts.notice) : "",
    opts.joinUrl
      ? `<p style="margin:0 0 12px">
           <a href="${esc(opts.joinUrl)}"
              style="display:inline-block;background:#fff;color:#0c0c0c;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px">
             미팅 입장하기
           </a>
         </p>
         <p style="margin:0;font-size:13px;color:rgba(215,226,234,.6)">
           이 버튼은 누르는 시점의 최신 링크로 연결됩니다. 일정이나 링크가 바뀌어도
           같은 버튼을 쓰시면 됩니다.
         </p>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  const html = shell(copy.lead(esc(opts.name)), rows, "이 메일은 운영진이 직접 발송했습니다.");

  const text = [
    copy.lead(opts.name),
    ``,
    `지원 포지션: ${opts.position}`,
    when ? `일시: ${when}` : "",
    ``,
    opts.notice ?? "",
    opts.joinUrl ? `\n미팅 입장: ${opts.joinUrl}\n(누르는 시점의 최신 링크로 연결됩니다)` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return deliver(opts.to, copy.subject, html, text);
}
