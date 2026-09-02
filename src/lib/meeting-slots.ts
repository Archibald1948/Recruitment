/**
 * 화상 미팅 희망 시간 후보.
 *
 * 지원자가 고르는 목록과 서버가 검사하는 목록이 같아야 한다. 두 곳에 규칙을
 * 나눠 적으면 화면에서 막았는데 API로는 통과하는 구멍이 생긴다. 그래서 규칙은
 * 여기 한 곳에만 두고, 폼과 검증이 같은 함수를 부른다.
 *
 * 모든 시각은 한국 시간이다. 슬롯 값은 "2026-09-12T09:00" 꼴의 벽시계 문자열로
 * 다루고, 저장할 때만 +09:00을 붙인다. 브라우저 표준 시간대에 흔들리지 않는다.
 */

export const MEETING = {
  /** 미팅 진행 기간 (양 끝 포함) */
  from: "2026-09-12",
  to: "2026-09-18",
  /** 미팅은 20분 남짓, 앞뒤 여유를 두고 30분 간격으로 끊는다. */
  stepMinutes: 30,
  /**
   * 하루 중 열어두는 시간. close는 마지막 슬롯이 시작하는 시각이다.
   *
   * 밤 시간대 상한은 따로 지정받지 않았다. 자정까지 열어두면 23:30 면접이
   * 잡힐 수 있어 22:00으로 닫아뒀다. 늘리려면 이 값만 고치면 된다.
   */
  open: "09:00",
  close: "22:00",
} as const;

/** 날짜별 예외. 여기 없는 날은 위 기본값을 따른다. */
const OVERRIDES: Record<string, { open?: string; blocked?: [string, string][] }> = {
  // 일요일 낮은 비운다.
  "2026-09-13": { blocked: [["11:00", "18:00"]] },
  // 평일은 오후부터.
  "2026-09-15": { open: "14:00" },
  "2026-09-16": { open: "14:00" },
  "2026-09-17": { open: "14:00" },
  "2026-09-18": { open: "14:00" },
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHhmm = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

function eachDate(from: string, to: string): string[] {
  const out: string[] = [];
  // 정오 기준으로 하루씩 더한다. 자정 기준이면 서머타임이 있는 지역에서 날짜가 밀린다.
  for (let d = new Date(`${from}T12:00:00Z`); ; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    out.push(iso);
    if (iso >= to) break;
  }
  return out;
}

export interface SlotDay {
  /** "2026-09-12" */
  date: string;
  /** "9월 12일 (토)" */
  label: string;
  /** 슬롯 시작 시각 "09:00" 목록 */
  times: string[];
}

/** 규칙만으로 만든 전체 후보. 시간이 지났는지는 보지 않는다. */
export function allSlotDays(): SlotDay[] {
  return eachDate(MEETING.from, MEETING.to).map((date) => {
    const rule = OVERRIDES[date] ?? {};
    const start = toMin(rule.open ?? MEETING.open);
    const end = toMin(MEETING.close);
    const blocked = (rule.blocked ?? []).map(([a, b]) => [toMin(a), toMin(b)] as const);

    const times: string[] = [];
    for (let m = start; m <= end; m += MEETING.stepMinutes) {
      // 막힌 구간은 시작은 포함, 끝은 제외한다. "11시~18시까지 안 됨"이면
      // 11:00은 막히고 18:00은 열린다.
      if (blocked.some(([a, b]) => m >= a && m < b)) continue;
      times.push(toHhmm(m));
    }

    const d = new Date(`${date}T12:00:00+09:00`);
    const label = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(d);

    return { date, label, times };
  });
}

/** 슬롯 값 → 저장용 ISO. "2026-09-12T09:00" → "2026-09-12T09:00:00+09:00" */
export function slotToIso(value: string): string {
  return `${value}:00+09:00`;
}

const SLOT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * 규칙에 있는 슬롯인지, 그리고 아직 지나지 않았는지 본다.
 *
 * 폼을 열어둔 채 시간이 흘러 그 슬롯이 지나버릴 수 있다. 지난 시각을 희망
 * 시간으로 받아봐야 쓸모가 없으므로 서버에서도 같이 막는다.
 */
export function isSelectableSlot(value: string, now: Date = new Date()): boolean {
  if (!SLOT_RE.test(value)) return false;
  const [date, time] = value.split("T");
  const day = allSlotDays().find((d) => d.date === date);
  if (!day || !day.times.includes(time)) return false;
  return new Date(slotToIso(value)).getTime() > now.getTime();
}

/** 지나지 않은 슬롯만. 폼에 그릴 목록이다. */
export function openSlotDays(now: Date = new Date()): SlotDay[] {
  return allSlotDays()
    .map((d) => ({
      ...d,
      times: d.times.filter((t) => new Date(slotToIso(`${d.date}T${t}`)).getTime() > now.getTime()),
    }))
    .filter((d) => d.times.length > 0);
}

/** 저장된 ISO를 사람이 읽는 문구로. "9월 12일 (토) 오전 9:00" */
export function formatSlot(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
