import { notion, resolveDataSourceId } from "./notion";

/**
 * Q&A 게시판.
 *
 * 질문은 사이트에서 들어오고, 답변은 노션에서 단다. 운영진이 "답변" 칸을
 * 채우면 그게 곧 사이트의 답변이 된다 — 별도의 관리자 화면을 만들지 않는
 * 이유가 이것이다. 노션 자체가 관리 UI다.
 *
 * 답변을 rich_text 속성에 두는 이유: 목록 조회 한 번으로 질문과 답변을 함께
 * 가져올 수 있다. 본문 블록에 두면 글마다 blocks 조회가 따로 필요해
 * 노션 API 한도(초당 3회)에 금방 걸린다. 대신 속성 한 칸은 2000자까지다.
 */

export const QNA_PROP = {
  question: "질문",
  nickname: "닉네임",
  answer: "답변",
  answeredBy: "답변자",
  published: "공개",
} as const;

/** 답변자 이름을 비워두면 이렇게 표시한다. */
export const DEFAULT_ANSWERER = "운영진";

export interface QnaEntry {
  id: string;
  question: string;
  nickname: string;
  answer: string;
  answeredBy: string;
  createdAt: string;
  answeredAt: string;
}

function qnaDataSourceId(): Promise<string> {
  return resolveDataSourceId("NOTION_QNA_DATA_SOURCE_ID", "NOTION_QNA_DATABASE_ID");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function readText(prop: any): string {
  const arr = prop?.rich_text ?? prop?.title;
  if (!Array.isArray(arr)) return "";
  return arr.map((t: any) => t.plain_text ?? "").join("");
}

const chunk = (v: string) => (v ? [{ type: "text" as const, text: { content: v.slice(0, 1900) } }] : []);

function toEntry(page: any): QnaEntry {
  const p = page.properties ?? {};
  const answer = readText(p[QNA_PROP.answer]).trim();
  return {
    id: page.id,
    question: readText(p[QNA_PROP.question]),
    nickname: readText(p[QNA_PROP.nickname]),
    answer,
    answeredBy: readText(p[QNA_PROP.answeredBy]).trim() || DEFAULT_ANSWERER,
    createdAt: page.created_time ?? "",
    // 답변이 달린 시각을 따로 기록하지 않는다. 마지막 수정 시각이 곧 답변 시각이다.
    answeredAt: answer ? (page.last_edited_time ?? "") : "",
  };
}

/**
 * 공개된 질문을 최신순으로 가져온다.
 *
 * "공개" 체크가 꺼진 글은 목록에서 빠진다. 스팸이나 부적절한 글은 노션에서
 * 체크만 해제하면 사이트에서 즉시 사라진다.
 */
export async function listQuestions(limit = 100): Promise<QnaEntry[]> {
  const data_source_id = await qnaDataSourceId();
  const res = (await notion().dataSources.query({
    data_source_id,
    filter: { property: QNA_PROP.published, checkbox: { equals: true } } as any,
    sorts: [{ timestamp: "created_time", direction: "descending" }] as any,
    page_size: Math.min(limit, 100),
  })) as any;

  return (res.results ?? []).map(toEntry).filter((e: QnaEntry) => e.question);
}

export async function createQuestion(input: { nickname: string; question: string }) {
  const data_source_id = await qnaDataSourceId();
  await notion().pages.create({
    parent: { type: "data_source_id", data_source_id } as any,
    properties: {
      [QNA_PROP.question]: { title: chunk(input.question) },
      [QNA_PROP.nickname]: { rich_text: chunk(input.nickname) },
      // 바로 공개한다. 운영진이 노션에서 체크를 해제하면 내려간다.
      [QNA_PROP.published]: { checkbox: true },
    } as any,
  });
}
