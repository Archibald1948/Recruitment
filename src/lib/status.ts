/**
 * 심사 상태.
 *
 * 노션 셀렉트 옵션 이름이 곧 상태값이다. 문자열이 한 글자라도 어긋나면
 * 단계 표시와 안내 메일 문구가 동시에 어긋나므로, 그 판정을 여기 한 곳에 모은다.
 *
 * 의존성이 없다. 클라이언트 컴포넌트에서 import해도 노션 SDK가 번들에 딸려오지
 * 않아야 하기 때문이다.
 */

export const STATUS_FLOW = ["접수됨", "서류 검토", "구글 미트", "합류", "불합격"] as const;
export type ApplicationStatus = (typeof STATUS_FLOW)[number];

/** 지원자 화면에 단계로 그려지는 값. 불합격은 단계가 아니라 별도 문구로 빠진다. */
export const STEPS = ["접수됨", "서류 검토", "구글 미트", "합류"] as const;

/** 이름을 바꾸기 전에 저장된 값. 노션 옵션을 아직 안 고쳤어도 동작하게 한다. */
const LEGACY: Record<string, ApplicationStatus> = {
  커피챗: "구글 미트",
  "줌 미팅": "구글 미트",
  보류: "불합격",
};

const squash = (v: string) => v.replace(/\s+/g, "");

/**
 * 노션에서 읽은 값을 코드가 아는 상태값으로 맞춘다.
 * 띄어쓰기 차이와 예전 이름("커피챗", "줌 미팅", "보류")을 흡수하고,
 * 모르는 값이면 빈 문자열.
 */
export function canonicalStatus(raw: string): ApplicationStatus | "" {
  const trimmed = raw.trim();
  const mapped = LEGACY[trimmed];
  if (mapped) return mapped;
  return STATUS_FLOW.find((s) => squash(s) === squash(trimmed)) ?? "";
}

/** 단계 인덱스. 불합격이거나 모르는 값이면 -1 */
export function stepIndex(raw: string): number {
  const s = canonicalStatus(raw);
  return s ? STEPS.indexOf(s as (typeof STEPS)[number]) : -1;
}

export function isRejected(raw: string): boolean {
  return canonicalStatus(raw) === "불합격";
}
