/** 입력값 정리 헬퍼. 클라이언트와 서버 양쪽에서 같은 규칙을 쓴다. */

/**
 * 한국 전화번호에 하이픈을 자동으로 넣는다.
 * 02(서울)는 국번이 3~4자리라 따로 처리한다.
 */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (!d) return "";

  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 6) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }

  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7, 11)}`;
}

/** 전화번호 자릿수가 그럴듯한지. 비어 있으면 통과(선택 항목). */
export function isPlausiblePhone(value: string): boolean {
  const d = value.replace(/\D/g, "");
  if (!d) return true;
  return d.length >= 9 && d.length <= 11;
}

/** 프로토콜이 빠진 링크에 https://를 붙인다. */
export function normalizeUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+/i.test(v)) return `https://${v}`;
  return v;
}

/**
 * 미팅 일시를 한국 시간으로 표기한다.
 *
 * 노션 Date는 날짜만 고르면 시간이 없다. 그때 "오전 9:00" 같은 없는 시각을
 * 지어내지 않도록 날짜까지만 적는다.
 */
export function formatMeetingAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const dateOnly = iso.length === 10;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    ...(dateOnly ? {} : { hour: "numeric", minute: "2-digit" }),
  }).format(d);
}

/**
 * 노션 날짜 ↔ <input type="datetime-local"> 값 변환.
 *
 * 브라우저의 표준 시간대를 따르지 않고 언제나 한국 시간으로 읽고 쓴다.
 * 운영자가 해외에서 열어도 노션에 적힌 시각과 화면의 시각이 같아야 한다.
 */
export function toDateTimeLocalKst(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // sv-SE는 "2026-09-10 19:00" 꼴로 나와 그대로 자르기 좋다.
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(d)
    .replace(" ", "T");
}

/** 비었으면 null — 노션에서 날짜를 지우겠다는 뜻이다. */
export function fromDateTimeLocalKst(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+09:00` : null;
}
