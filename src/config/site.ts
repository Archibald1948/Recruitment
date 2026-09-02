/**
 * 자주 바뀌는 값은 전부 여기서 관리한다.
 * 모집 인원 / 마감일 / 진행 상황이 바뀌면 이 파일만 고치면 된다.
 */

export type PositionId = "pm" | "frontend" | "backend" | "design";

export interface Position {
  id: PositionId;
  no: string;
  /** 화면에 노출되는 이름 */
  title: string;
  /** 영문 보조 라벨 */
  label: string;
  /** 모집 중이면 true. false면 '모집 완료' 배지가 붙고 지원 폼 선택지에서 빠진다. */
  open: boolean;
  /** 모집 인원 문구. 미정이면 'n명' */
  headcount: string;
  /** 이미 합류한 인원처럼, 모집 상태와 별개로 알릴 내용 */
  note?: string;
  summary: string;
  /** 주요 역할 / 예상 스택 */
  points: string[];
  /** 이런 분이면 좋습니다 */
  wants: string[];
  /** 포지션 전용 질문 (지원 폼 분기) */
  questions: { id: string; label: string; placeholder: string; required: boolean }[];
}

export const site = {
  name: "Build It, Ship It Together",
  /** 히어로 헤드라인 — 영문 2줄 (도트 폰트는 한글을 렌더하지 못한다) */
  headline: ["Build It", "Ship It Together"],
  subhead:
    "기획부터 개발, 배포, 그리고 실제 사용자를 만나는 운영까지.\n하나의 서비스를 끝까지 완성할 팀원을 찾습니다.",

  /**
   * 모집 마감. D-day 카운트와 접수 차단의 기준값.
   * NEXT_PUBLIC_DEADLINE 환경변수로 덮어쓸 수 있어, 마감일만 바꿀 때는
   * 코드를 고치지 않고 Vercel 환경변수만 수정하면 된다.
   */
  deadline: process.env.NEXT_PUBLIC_DEADLINE || "2026-09-14T23:59:59+09:00",
  startsAt: "2026년 9월",
  duration: "3개월 이상",
  meeting: "주 1회",
  /** 히어로/지원 섹션에 노출할 현재 진행 상황 */
  stage: "팀 빌딩 단계 · 프론트엔드 1명, 백엔드 1명 합류 완료",

  /** 문의처 — TODO: 실제 값으로 교체 */
  contactEmail: "",

  /** 마퀴 2줄 */
  marquee: {
    top: ["GitHub", "Notion", "Discord", "Figma", "Pull Request", "Code Review", "Issue", "회의록"],
    bottom: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Spring Boot",
      "Node.js",
      "FastAPI",
      "PostgreSQL",
      "REST API",
      "AWS",
    ],
  },

  /** 개발 프로세스 (PROCESS 카드 1) */
  process: [
    "아이디어 구체화",
    "시장 및 사용자 조사",
    "기능 및 요구사항 정의",
    "UI/UX 설계",
    "DB / API 설계",
    "프론트엔드 · 백엔드 개발",
    "통합 및 테스트",
    "서비스 배포",
    "사용자 모집",
    "피드백 수집 및 개선",
    "지속적인 운영",
  ],

  /** 얻어갈 수 있는 것 (PROCESS 카드 3) */
  gains: [
    "Git / GitHub 기반 협업 경험",
    "Issue · Branch · PR 기반의 실무형 개발 프로세스",
    "코드 리뷰 경험",
    "서비스 아이디어 기획 경험",
    "요구사항 정의 및 기능 명세",
    "UI/UX 협업 경험",
    "API 및 DB 설계 경험",
    "FE · BE 간 협업 경험",
    "테스트 및 배포 경험",
    "실제 사용자 모집 · 피드백 수집",
    "서비스 개선 및 운영 경험",
    "당장 취준에 활용할 수 있는 프로젝트",
  ],

  /**
   * 리크루팅 절차. 지원 버튼 누르기 직전에 보이는 정보라 지원 섹션 위에 둔다.
   * 노션 상태값(접수됨 / 서류 검토 / 커피챗 / 합류)과 같은 흐름이다.
   */
  recruitingSteps: [
    { step: "01", title: "서류 접수", desc: "지원서를 검토합니다. 접수 확인 메일이 바로 발송됩니다." },
    { step: "02", title: "줌 미팅", desc: "서류 통과 시 온라인으로 짧게 이야기 나눕니다." },
    { step: "03", title: "최종 결과", desc: "합류 여부를 메일로 안내드립니다." },
  ],

  /** 주간 참여 가능 시간 선택지 */
  availability: ["5시간 미만", "5~10시간", "10~15시간", "15시간 이상"],

  /** 개인정보 안내 문구. 메일·지원 폼·안내 페이지가 모두 이 문장을 쓴다. */
  privacyNotice:
    "수집된 개인정보는 리크루팅에만 사용되고, 리크루팅 종료와 즉시 파기됩니다.",
  /** 표 형태로 보여줄 때 쓰는 짧은 표현 */
  privacyRetention: "리크루팅 종료와 즉시 파기",
  privacyPurpose: "팀 프로젝트 팀원 리크루팅",
} as const;

export const positions: Position[] = [
  {
    id: "pm",
    no: "01",
    title: "기획 / PM",
    label: "Product / Planning",
    open: true,
    headcount: "n명",
    summary:
      "서비스 방향을 잡고, 아이디어를 기능으로 옮기고, 출시 이후 사용자까지 데려오는 자리입니다.",
    points: [
      "서비스 아이디어 구체화 및 방향성 설정",
      "시장·경쟁 서비스 및 사용자 니즈 조사",
      "핵심 기능 및 요구사항 정의",
      "개발·디자인 파트와 일정 및 요구사항 조율",
      "출시 이후 사용자 유입 및 초기 마케팅 전략",
    ],
    wants: [
      "내가 생각한 서비스를 직접 만들어보고 싶은 분",
      "아이디어를 구체적인 기능과 구조로 정리하는 것을 좋아하는 분",
      "개발자·디자이너와 적극적으로 소통할 수 있는 분",
      "시장과 사용자 관점에서 서비스를 고민할 수 있는 분",
      "기획을 넘어 출시·마케팅·운영까지 경험해 보고 싶은 분",
    ],
    questions: [
      {
        id: "priority",
        label:
          "개발 기간이 제한되어 모든 기능을 구현할 수 없다면, 어떤 기준으로 기능의 우선순위를 결정하시겠어요?",
        placeholder: "무엇을 먼저 만들고 무엇을 미룰지, 그 판단 기준을 적어주세요.",
        required: true,
      },
      {
        id: "goodService",
        label: "본인이 생각하는 좋은 서비스란 무엇인가요?",
        placeholder: "예시가 되는 서비스를 들어 설명해 주셔도 좋습니다.",
        required: true,
      },
      {
        id: "domain",
        label: "관심 있는 서비스 도메인과 그 이유를 알려주세요.",
        placeholder: "어떤 문제를 다루는 서비스에 관심이 있는지, 왜 그런지",
        required: false,
      },
      {
        id: "successMetric",
        label:
          "서비스를 출시한 뒤, 잘 되고 있는지를 무엇으로 판단하시겠어요?",
        placeholder: "보고 싶은 지표나 확인하고 싶은 사용자 반응을 적어주세요.",
        required: false,
      },
    ],
  },
  {
    id: "frontend",
    no: "02",
    title: "Front-End",
    label: "Front-End",
    open: true,
    headcount: "n명",
    note: "1명 합류 완료",
    summary: "React / Next.js로 사용자가 실제로 만지는 화면을 만듭니다.",
    points: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Git / GitHub"],
    wants: [
      "React 또는 Next.js 개발 경험이 있는 분",
      "API 연동 경험이 있거나 경험해 보고 싶은 분",
      "맡은 기능을 끝까지 구현하려는 책임감이 있는 분",
    ],
    questions: [
      {
        id: "handoff",
        label:
          "디자이너가 건넨 시안에 구현이 어려운 부분이 있다면, 어떻게 풀어가시겠어요?",
        placeholder: "그대로 구현할지, 대안을 제안할지, 어떻게 이야기를 꺼낼지 적어주세요.",
        required: true,
      },
      {
        id: "apiFailure",
        label:
          "API 응답이 느리거나 실패하는 상황을 화면에서 어떻게 다루시겠어요?",
        placeholder: "로딩·에러·재시도를 사용자에게 어떻게 보여줄지 생각을 적어주세요.",
        required: true,
      },
      {
        id: "memorableWork",
        label:
          "React 또는 Next.js로 만들어 본 것 중 가장 기억에 남는 화면과, 그때 어려웠던 점을 알려주세요.",
        placeholder: "규모는 상관없습니다. 무엇이 어려웠고 어떻게 해결했는지가 궁금합니다.",
        required: false,
      },
      {
        id: "perfA11y",
        label:
          "성능이나 접근성 때문에 구현 방식을 바꿔본 경험이 있다면 알려주세요.",
        placeholder: "없으면 비워두셔도 됩니다.",
        required: false,
      },
    ],
  },
  {
    id: "backend",
    no: "03",
    title: "Back-End",
    label: "Back-End",
    open: true,
    headcount: "n명",
    note: "1명 합류 완료",
    summary: "API와 DB를 설계하고, 서비스를 배포하고 운영합니다.",
    points: ["Spring Boot / Node.js / FastAPI", "PostgreSQL", "REST API", "AWS 등 Cloud", "Git / GitHub"],
    wants: [
      "백엔드 API 개발 경험이 있거나 역량을 키우고 싶은 분",
      "DB 설계 및 서버 개발에 관심이 있는 분",
      "배포 및 운영까지 경험해 보고 싶은 분",
    ],
    questions: [
      {
        id: "debugging",
        label:
          "개발 중 서버 오류나 예상하지 못한 문제가 발생했을 때, 어떤 방식으로 원인을 찾고 해결하는 편인가요?",
        placeholder: "실제로 겪었던 상황을 예로 들어 주시면 좋습니다.",
        required: true,
      },
      {
        id: "apiDesign",
        label:
          "API를 설계하거나 개발해본 경험이 있다면, 어떤 방식으로 설계했는지 또는 어떤 걸 개발해봤는지 간단히 설명해주세요.",
        placeholder: "규모는 상관없습니다. 어떤 고민을 했는지가 궁금합니다.",
        required: true,
      },
      {
        id: "beStack",
        label: "주로 사용하는 언어와 프레임워크를 알려주세요.",
        placeholder: "예: Java / Spring Boot, Node.js / Express …",
        required: false,
      },
      {
        id: "deployOps",
        label:
          "서버를 직접 배포하거나 운영해 본 경험이 있다면 알려주세요.",
        placeholder: "사용한 환경과, 배포하면서 겪은 문제가 있었다면 함께 적어주세요.",
        required: false,
      },
    ],
  },
  {
    id: "design",
    no: "04",
    title: "UI/UX Designer",
    label: "Design",
    open: true,
    headcount: "n명",
    summary: "화면 뒤의 흐름부터 설계하고, 개발자가 실제로 구현할 수 있는 디자인을 만듭니다.",
    points: ["Figma", "디자인 시스템", "개발자와의 핸드오프"],
    wants: [
      "모바일 또는 웹 서비스 UI/UX 디자인에 관심이 있는 분",
      "개발자와 소통하며 구현 가능한 디자인을 만들어 보고 싶은 분",
      "실제 서비스 기반 포트폴리오를 만들어 보고 싶은 분",
    ],
    questions: [
      {
        id: "figmaCollab",
        label: "Figma 사용 수준과 개발자와의 협업 경험을 알려주세요.",
        placeholder:
          "컴포넌트·오토레이아웃·프로토타입 등 어디까지 다뤄보셨는지, 개발자와 함께 작업해 본 경험이 있다면 함께 적어주세요.",
        required: true,
      },
      {
        id: "usability",
        label:
          "본인이 만든 디자인이 실제 사용자에게 사용하기 어렵다는 피드백을 받는다면, 어떤 방식으로 원인을 확인하고 개선하시겠어요?",
        placeholder: "무엇을 먼저 확인하고 어떤 순서로 접근할지 적어주세요.",
        required: true,
      },
      {
        id: "wireframe",
        label:
          "와이어프레임에서 최종 UI 디자인으로 발전시키는 과정에서 가장 중요하게 생각하는 부분은 무엇인가요?",
        placeholder: "없으면 비워두셔도 됩니다.",
        required: false,
      },
      {
        id: "designSystem",
        label:
          "화면이 여러 개로 늘어나도 스타일을 일관되게 유지하려면 무엇이 필요하다고 생각하시나요?",
        placeholder: "컬러·타이포·컴포넌트를 어떻게 정리해 두실지 적어주세요.",
        required: false,
      },
    ],
  },
];

export const openPositions = positions.filter((p) => p.open);
export const positionById = (id: string) => positions.find((p) => p.id === id);

function deadlineMs(): number {
  const t = new Date(site.deadline).getTime();
  // 날짜 문자열이 잘못되면 NaN이 되고, 모든 비교가 false가 되어
  // 마감 판정이 조용히 깨진다. 그때는 마감이 없는 것으로 본다.
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/** 남은 일수. 마감일이 지났으면 0 */
export function daysLeft(now: Date = new Date()): number {
  const ms = deadlineMs();
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.ceil((ms - now.getTime()) / 86_400_000));
}

export function isClosed(now: Date = new Date()): boolean {
  return deadlineMs() < now.getTime();
}
