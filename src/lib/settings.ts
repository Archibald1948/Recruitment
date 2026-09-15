import { site } from "@/config/site";
import { notion, resolveDataSourceId } from "./notion";

/**
 * 노션에서 읽어오는 운영 설정.
 *
 * 마감일처럼 운영 중에 바뀔 수 있는 값을 코드나 환경변수에 두면, 바꿀 때마다
 * 재배포가 필요하다. NEXT_PUBLIC_* 는 빌드 시점에 번들에 그대로 박히고,
 * Vercel 환경변수도 배포에 묶이기 때문이다. 노션에 두면 운영진이 날짜만
 * 고치면 된다.
 *
 * 노션이 죽거나 값이 비어 있으면 코드의 기본값으로 되돌아간다. 마감일을
 * 못 읽는다고 지원 폼 전체가 멈추면 안 된다.
 */

const SETTING = {
  deadline: "모집 마감일",
} as const;

const PROP = {
  key: "항목",
  date: "값(날짜)",
} as const;

/** 노션 호출을 매 요청마다 하지 않는다. API 한도(초당 3회)에 걸린다. */
const CACHE_MS = 60_000;

let cached: { value: string; at: number } | null = null;

function settingsDataSourceId(): Promise<string> {
  return resolveDataSourceId("NOTION_SETTINGS_DATA_SOURCE_ID", "NOTION_SETTINGS_DATABASE_ID");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchDeadline(): Promise<string | null> {
  const data_source_id = await settingsDataSourceId();
  const res = (await notion().dataSources.query({
    data_source_id,
    filter: { property: PROP.key, title: { equals: SETTING.deadline } } as any,
    page_size: 1,
  })) as any;

  const start = res.results?.[0]?.properties?.[PROP.date]?.date?.start;
  if (typeof start !== "string" || !start) return null;

  // 날짜만 고르면 시간이 빠진다. 그날 하루는 열어두는 것이 자연스럽다.
  const withTime = start.length === 10 ? `${start}T23:59:59+09:00` : start;
  return Number.isNaN(new Date(withTime).getTime()) ? null : withTime;
}

/**
 * 모집 마감일(ISO 문자열).
 *
 * 서버에서만 쓴다. 화면의 남은 시간은 서버가 이 값을 넘기면 브라우저가
 * 직접 센다(useNow). 그래서 페이지 캐시가 묵어도 카운트다운은 흐른다.
 */
export async function getDeadline(): Promise<string> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.value;

  try {
    const value = (await fetchDeadline()) ?? site.deadline;
    cached = { value, at: now };
    return value;
  } catch (e) {
    console.error("[settings] 마감일 조회 실패, 기본값을 씁니다:", e);
    // 실패도 잠시 기억한다. 노션이 죽었을 때 매 요청마다 재시도하지 않도록.
    cached = { value: site.deadline, at: now };
    return site.deadline;
  }
}

/**
 * 마감일과, 그 값을 읽은 서버 시각.
 *
 * 남은 시간은 브라우저가 센다. 다만 서버 HTML과 하이드레이션 첫 화면이 같아야
 * 하므로 서버가 그린 시각을 함께 넘긴다. 컴포넌트 본문에서 시각을 읽으면
 * 렌더가 입력만으로 결정되지 않는다. 데이터를 읽는 이 자리에서 한 번만 잡는다.
 */
export async function getDeadlineSnapshot(): Promise<{ deadline: string; now: number }> {
  return { deadline: await getDeadline(), now: Date.now() };
}
