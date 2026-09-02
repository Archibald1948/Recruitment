import { positionById, positions, site } from "@/config/site";
import { formatPhone, isPlausiblePhone, normalizeUrl } from "./format";

export interface ApplicationInput {
  name: string;
  email: string;
  phone?: string;
  position: string;
  oneLiner: string;
  motivation: string;
  experience?: string;
  portfolio?: string;
  availability: string;
  agree: boolean;
  answers: Record<string, string>;
  ref?: string;
  /** 허니팟 — 사람이면 비어 있어야 한다 */
  company?: string;
}

export type Errors = Partial<Record<keyof ApplicationInput | string, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * 노션 rich_text 속성은 **한 칸에 총 2000자**까지만 저장된다.
 * 포지션별 답변은 여러 질문을 한 칸에 모아 넣으므로, 질문 수(최대 4개)와
 * 질문 라벨 길이를 감안해 답변 하나를 400자로 제한한다.
 * 이 한도를 넘기면 저장 시점에 조용히 잘려 답변이 사라진다.
 */
const MAX = { name: 40, oneLiner: 60, text: 2000, answer: 400, url: 300 };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateApplication(
  raw: unknown,
  { requirePosition = true }: { requirePosition?: boolean } = {},
): { ok: boolean; errors: Errors; value: ApplicationInput } {
  const body = (raw ?? {}) as Record<string, unknown>;
  const errors: Errors = {};

  const value: ApplicationInput = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    phone: formatPhone(str(body.phone)) || undefined,
    position: str(body.position),
    oneLiner: str(body.oneLiner),
    motivation: str(body.motivation),
    experience: str(body.experience) || undefined,
    portfolio: normalizeUrl(str(body.portfolio)) || undefined,
    availability: str(body.availability),
    agree: body.agree === true || body.agree === "true",
    answers: {},
    ref: str(body.ref).slice(0, 60) || undefined,
    company: str(body.company) || undefined,
  };

  if (!value.name) errors.name = "이름을 입력해 주세요.";
  else if (value.name.length > MAX.name) errors.name = `이름은 ${MAX.name}자 이내로 입력해 주세요.`;

  if (!value.email) errors.email = "이메일을 입력해 주세요.";
  else if (!EMAIL_RE.test(value.email)) errors.email = "이메일 형식이 올바르지 않습니다.";

  const position = positionById(value.position);
  if (requirePosition) {
    if (!position) errors.position = "지원 포지션을 선택해 주세요.";
    else if (!position.open) errors.position = "현재 모집이 마감된 포지션입니다.";
  }

  if (!value.oneLiner) errors.oneLiner = "한 줄 소개를 입력해 주세요.";
  else if (value.oneLiner.length > MAX.oneLiner)
    errors.oneLiner = `${MAX.oneLiner}자 이내로 입력해 주세요.`;

  if (!value.motivation) errors.motivation = "지원 동기를 입력해 주세요.";
  else if (value.motivation.length > MAX.text) errors.motivation = "너무 깁니다. 2000자 이내로 줄여주세요.";

  if (value.experience && value.experience.length > MAX.text)
    errors.experience = "너무 깁니다. 2000자 이내로 줄여주세요.";

  if (value.phone && !isPlausiblePhone(value.phone))
    errors.phone = "연락처 자릿수를 확인해 주세요.";

  if (value.portfolio) {
    if (value.portfolio.length > MAX.url) errors.portfolio = "링크가 너무 깁니다.";
    else if (!/^https?:\/\//i.test(value.portfolio))
      errors.portfolio = "http:// 또는 https:// 로 시작하는 링크를 입력해 주세요.";
  }

  if (!value.availability) errors.availability = "참여 가능 시간을 선택해 주세요.";
  else if (!site.availability.includes(value.availability as never))
    errors.availability = "선택지에서 골라주세요.";

  if (!value.agree) errors.agree = "개인정보 수집·이용에 동의해 주세요.";

  // 포지션 분기 질문
  const rawAnswers = (body.answers ?? {}) as Record<string, unknown>;
  const target = position ?? positions.find((p) => p.id === value.position);
  if (target) {
    for (const q of target.questions) {
      const a = str(rawAnswers[q.id]);
      if (q.required && !a) errors[`answers.${q.id}`] = "이 항목은 필수입니다.";
      else if (a.length > MAX.answer)
        errors[`answers.${q.id}`] = `${MAX.answer}자 이내로 줄여주세요. (현재 ${a.length}자)`;
      if (a) value.answers[q.id] = a;
    }
  }

  return { ok: Object.keys(errors).length === 0, errors, value };
}

/** 포지션별 답변을 노션 rich_text 한 덩어리로 직렬화 */
export const ANSWER_MAX = MAX.answer;

export function serializeAnswers(positionId: string, answers: Record<string, string>): string {
  const p = positionById(positionId);
  if (!p) return "";
  return p.questions
    .filter((q) => answers[q.id])
    .map((q) => `[${q.label}]\n${answers[q.id]}`)
    .join("\n\n");
}


export interface ContactInput {
  name: string;
  email: string;
  message: string;
  /** 허니팟 — 사람이면 비어 있어야 한다 */
  company?: string;
}

const MAX_MESSAGE = 1000;

export function validateContact(raw: unknown): {
  ok: boolean;
  errors: Errors;
  value: ContactInput;
} {
  const body = (raw ?? {}) as Record<string, unknown>;
  const errors: Errors = {};

  const value: ContactInput = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    message: str(body.message),
    company: str(body.company) || undefined,
  };

  if (!value.name) errors.name = "이름을 입력해 주세요.";
  else if (value.name.length > MAX.name) errors.name = `이름은 ${MAX.name}자 이내로 입력해 주세요.`;

  if (!value.email) errors.email = "답장받을 이메일을 입력해 주세요.";
  else if (!EMAIL_RE.test(value.email)) errors.email = "이메일 형식이 올바르지 않습니다.";

  if (!value.message) errors.message = "문의 내용을 입력해 주세요.";
  else if (value.message.length > MAX_MESSAGE)
    errors.message = `${MAX_MESSAGE}자 이내로 줄여주세요. (현재 ${value.message.length}자)`;

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export const CONTACT_MAX_MESSAGE = MAX_MESSAGE;

/* ── Q&A 게시판 ────────────────────────────────────────────── */

export interface QuestionInput {
  nickname: string;
  question: string;
  /** 허니팟 — 사람이면 비어 있어야 한다 */
  company?: string;
}

const QNA = { nickname: 20, question: 500 };

/**
 * 게시판 질문 검증.
 *
 * 이메일을 받지 않는다. 공개 게시판이라 답변도 공개로 달리고, 굳이 개인정보를
 * 새로 모을 이유가 없다. 대신 닉네임으로 본인 글을 알아볼 수 있게 한다.
 */
export function validateQuestion(raw: unknown): {
  ok: boolean;
  errors: Errors;
  value: QuestionInput;
} {
  const body = (raw ?? {}) as Record<string, unknown>;
  const errors: Errors = {};

  const value: QuestionInput = {
    nickname: str(body.nickname),
    question: str(body.question),
    company: str(body.company) || undefined,
  };

  if (!value.nickname) errors.nickname = "닉네임을 입력해 주세요.";
  else if (value.nickname.length > QNA.nickname)
    errors.nickname = `닉네임은 ${QNA.nickname}자 이내로 입력해 주세요.`;

  if (!value.question) errors.question = "질문을 입력해 주세요.";
  else if (value.question.length > QNA.question)
    errors.question = `${QNA.question}자 이내로 줄여주세요. (현재 ${value.question.length}자)`;

  return { ok: Object.keys(errors).length === 0, errors, value };
}

export const QNA_MAX_NICKNAME = QNA.nickname;
export const QNA_MAX_QUESTION = QNA.question;
