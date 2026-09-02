import { Client } from "@notionhq/client";
import type { ApplicationInput } from "./validation";
import { slotToIso } from "./meeting-slots";
import { serializeAnswers } from "./validation";
import { positionById } from "@/config/site";

/**
 * Notion SDK v5는 API 2025-09-03을 사용한다.
 * 이 버전부터 데이터베이스가 여러 data source를 가질 수 있어
 * 조회/생성은 database_id가 아니라 data_source_id로 한다.
 */

export const PROP = {
  name: "이름",
  email: "이메일",
  phone: "연락처",
  position: "포지션",
  status: "상태",
  oneLiner: "한 줄 소개",
  motivation: "지원 동기",
  experience: "관련 경험",
  answers: "포지션별 답변",
  portfolio: "포트폴리오",
  availability: "주간 참여 가능 시간",
  ref: "유입 경로",
  agree: "개인정보 동의",
  tokenHash: "수정 토큰 해시",

  /* 아래 넷은 운영진이 노션에서 직접 채우는 칸이다. 지원 폼은 건드리지 않는다. */
  meetingAt: "미팅 일시",
  zoomUrl: "미트 링크",
  notice: "안내 메시지",
  notifiedLog: "안내 발송",
  preferredSlot: "희망 미팅 시간",
} as const;

export { STATUS_FLOW, type ApplicationStatus } from "./status";

let client: Client | null = null;
export function notion(): Client {
  if (!client) {
    const auth = process.env.NOTION_TOKEN;
    if (!auth) throw new Error("NOTION_TOKEN 환경변수가 설정되지 않았습니다.");
    client = new Client({ auth });
  }
  return client;
}

const dataSourceIdCache = new Map<string, string>();

/**
 * 데이터베이스 id로부터 data source id를 한 번만 조회해 캐시한다.
 *
 * data source id를 환경변수로 직접 주면 조회를 건너뛴다. 지원자 DB와 Q&A DB가
 * 각각 다른 변수 쌍을 쓰므로 캐시는 환경변수 이름을 키로 잡는다.
 */
export async function resolveDataSourceId(
  dataSourceEnv: string,
  databaseEnv: string,
): Promise<string> {
  const cached = dataSourceIdCache.get(dataSourceEnv);
  if (cached) return cached;

  const explicit = process.env[dataSourceEnv]?.trim();
  if (explicit) {
    dataSourceIdCache.set(dataSourceEnv, explicit);
    return explicit;
  }

  const databaseId = process.env[databaseEnv]?.trim();
  if (!databaseId) throw new Error(`${databaseEnv} 환경변수가 설정되지 않았습니다.`);

  const db = (await notion().databases.retrieve({ database_id: databaseId })) as unknown as {
    data_sources?: { id: string }[];
  };
  const id = db.data_sources?.[0]?.id;
  if (!id) throw new Error("해당 데이터베이스에서 data source를 찾지 못했습니다.");

  dataSourceIdCache.set(dataSourceEnv, id);
  return id;
}

/** 지원자 관리 DB */
export function getDataSourceId(): Promise<string> {
  return resolveDataSourceId("NOTION_DATA_SOURCE_ID", "NOTION_DATABASE_ID");
}

/* ── 속성 헬퍼 ─────────────────────────────────────────────── */

const text = (v?: string) => (v ? [{ type: "text" as const, text: { content: v.slice(0, 1900) } }] : []);

/* eslint-disable @typescript-eslint/no-explicit-any */
function readText(prop: any): string {
  if (!prop) return "";
  const arr = prop.rich_text ?? prop.title;
  if (!Array.isArray(arr)) return "";
  return arr.map((t: any) => t.plain_text ?? "").join("");
}

function readSelect(prop: any): string {
  return prop?.select?.name ?? "";
}

export interface ApplicationRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  oneLiner: string;
  motivation: string;
  experience: string;
  answersRaw: string;
  portfolio: string;
  availability: string;
  ref: string;
  tokenHash: string;
  meetingAt: string;
  preferredSlot: string;
  zoomUrl: string;
  notice: string;
  notifiedLog: string;
  createdAt: string;
  updatedAt: string;
}

function toRecord(page: any): ApplicationRecord {
  const p = page.properties ?? {};
  return {
    id: page.id,
    name: readText(p[PROP.name]),
    email: p[PROP.email]?.email ?? "",
    phone: p[PROP.phone]?.phone_number ?? "",
    position: readSelect(p[PROP.position]),
    status: readSelect(p[PROP.status]) || "접수됨",
    oneLiner: readText(p[PROP.oneLiner]),
    motivation: readText(p[PROP.motivation]),
    experience: readText(p[PROP.experience]),
    answersRaw: readText(p[PROP.answers]),
    portfolio: p[PROP.portfolio]?.url ?? "",
    availability: readSelect(p[PROP.availability]),
    ref: readSelect(p[PROP.ref]),
    tokenHash: readText(p[PROP.tokenHash]),
    meetingAt: p[PROP.meetingAt]?.date?.start ?? "",
    preferredSlot: p[PROP.preferredSlot]?.date?.start ?? "",
    zoomUrl: p[PROP.zoomUrl]?.url ?? "",
    notice: readText(p[PROP.notice]),
    notifiedLog: readText(p[PROP.notifiedLog]),
    createdAt: page.created_time ?? "",
    updatedAt: page.last_edited_time ?? "",
  };
}

function buildProperties(input: ApplicationInput): Record<string, any> {
  const position = positionById(input.position);
  const props: Record<string, any> = {
    [PROP.name]: { title: text(input.name) },
    [PROP.email]: { email: input.email },
    [PROP.oneLiner]: { rich_text: text(input.oneLiner) },
    [PROP.motivation]: { rich_text: text(input.motivation) },
    [PROP.experience]: { rich_text: text(input.experience) },
    [PROP.answers]: { rich_text: text(serializeAnswers(input.position, input.answers)) },
    [PROP.availability]: { select: { name: input.availability } },
    [PROP.preferredSlot]: {
      date: input.meetingSlot ? { start: slotToIso(input.meetingSlot) } : null,
    },
    [PROP.agree]: { checkbox: input.agree },
  };

  if (position) props[PROP.position] = { select: { name: position.title } };
  props[PROP.phone] = input.phone ? { phone_number: input.phone } : { phone_number: null };
  props[PROP.portfolio] = input.portfolio ? { url: input.portfolio } : { url: null };
  if (input.ref) props[PROP.ref] = { select: { name: input.ref } };

  return props;
}

/* ── 공개 API ──────────────────────────────────────────────── */

export async function createApplication(input: ApplicationInput, tokenHash: string) {
  const data_source_id = await getDataSourceId();
  const page = await notion().pages.create({
    parent: { type: "data_source_id", data_source_id } as any,
    properties: {
      ...buildProperties(input),
      [PROP.status]: { select: { name: "접수됨" } },
      [PROP.tokenHash]: { rich_text: text(tokenHash) },
    } as any,
  });
  return page as any;
}

export async function getApplication(pageId: string): Promise<ApplicationRecord | null> {
  try {
    const page = await notion().pages.retrieve({ page_id: pageId });
    if ((page as any).archived || (page as any).in_trash) return null;
    return toRecord(page);
  } catch {
    return null;
  }
}

export async function updateApplication(pageId: string, input: ApplicationInput) {
  const props = buildProperties(input);
  // 이메일은 계정 키라 수정 대상에서 제외한다.
  delete props[PROP.email];
  await notion().pages.update({ page_id: pageId, properties: props as any });
}

/** 운영자 화면에서 고치는 심사 항목. 지원자가 쓴 값은 건드리지 않는다. */
export interface ReviewInput {
  status: string;
  meetingAt: string | null;
  zoomUrl: string;
  notice: string;
}

/**
 * 심사 항목만 덮어쓴다.
 *
 * 이름·이메일·지원 내용은 지원자의 것이므로 여기서 손대지 않는다. 운영자가
 * 실수로 지원서를 고쳐버리는 길을 아예 만들지 않는 편이 안전하다.
 */
export async function updateReview(pageId: string, input: ReviewInput) {
  await notion().pages.update({
    page_id: pageId,
    properties: {
      // 빈 값이면 셀렉트를 비운다. 상태를 되돌리는 길도 있어야 한다.
      [PROP.status]: input.status ? { select: { name: input.status } } : { select: null },
      [PROP.meetingAt]: { date: input.meetingAt ? { start: input.meetingAt } : null },
      [PROP.zoomUrl]: { url: input.zoomUrl || null },
      [PROP.notice]: { rich_text: text(input.notice) },
    } as any,
  });
}

/** 수정 이력을 페이지 본문에 누적한다. */
export async function appendHistory(pageId: string, line: string) {
  try {
    await notion().blocks.children.append({
      block_id: pageId,
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: text(line) },
        } as any,
      ],
    });
  } catch {
    // 이력 기록 실패가 수정 자체를 막지는 않는다.
  }
}

export async function findByEmail(email: string): Promise<ApplicationRecord | null> {
  const data_source_id = await getDataSourceId();
  const res = (await notion().dataSources.query({
    data_source_id,
    filter: { property: PROP.email, email: { equals: email } } as any,
    page_size: 1,
  })) as any;
  const first = res.results?.[0];
  return first ? toRecord(first) : null;
}

/**
 * 운영자 화면용 전체 목록. 최신순.
 *
 * 지원자 수가 수백을 넘길 사이트가 아니라 페이지네이션 없이 전부 훑는다.
 * 토큰 해시가 섞여 있으므로 응답으로 내보내기 전에 반드시 걷어내야 한다.
 */
export async function listApplications(): Promise<ApplicationRecord[]> {
  const data_source_id = await getDataSourceId();
  const out: ApplicationRecord[] = [];
  let cursor: string | undefined;

  do {
    const res = (await notion().dataSources.query({
      data_source_id,
      sorts: [{ timestamp: "created_time", direction: "descending" }] as any,
      page_size: 100,
      start_cursor: cursor,
    })) as any;
    out.push(...(res.results ?? []).map(toRecord));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return out;
}

/**
 * 안내 메일을 보낸 사실을 노션에 남긴다.
 *
 * 같은 사람에게 같은 안내를 두 번 보내는 사고를 막는 장치다. 운영자 화면이
 * 이 값을 그대로 보여주므로, 언제 어떤 상태로 보냈는지 한눈에 들어와야 한다.
 */
export async function markNotified(pageId: string, line: string) {
  await notion().pages.update({
    page_id: pageId,
    properties: { [PROP.notifiedLog]: { rich_text: text(line) } } as any,
  });
  await appendHistory(pageId, line);
}

/**
 * 이미 찜한 희망 시간 목록.
 *
 * 불합격 처리된 지원자의 자리는 비워준다. 떨어진 사람이 자리를 붙들고 있으면
 * 남은 지원자가 고를 칸만 줄어든다.
 */
export async function takenSlots(excludeId?: string): Promise<string[]> {
  const data_source_id = await getDataSourceId();
  const out: string[] = [];
  let cursor: string | undefined;

  do {
    const res = (await notion().dataSources.query({
      data_source_id,
      page_size: 100,
      start_cursor: cursor,
    })) as any;

    for (const page of res.results ?? []) {
      if (excludeId && page.id === excludeId) continue;
      const p = page.properties ?? {};
      if (readSelect(p[PROP.status]) === "불합격") continue;
      const slot = p[PROP.preferredSlot]?.date?.start;
      if (slot) out.push(slot);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return out;
}

export async function countApplications(): Promise<number> {
  const data_source_id = await getDataSourceId();
  let count = 0;
  let cursor: string | undefined;

  do {
    const res = (await notion().dataSources.query({
      data_source_id,
      page_size: 100,
      start_cursor: cursor,
    })) as any;
    count += res.results?.length ?? 0;
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  return count;
}
