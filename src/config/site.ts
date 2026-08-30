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
  summary: string;
  /** 주요 역할 / 예상 스택 */
  points: string[];
  /** 이런 분이면 좋습니다 */
  wants: string[];
  /** 포지션 전용 질문 (지원 폼 분기) */
  questions: { id: string; label: string; placeholder: string; required: boolean }[];
}

export const site = {
  name: "Team Project Recruiting",
  /** 히어로 헤드라인 — 영문 2줄 (도트 폰트는 한글을 렌더하지 못한다) */
  headline: ["Build It", "Ship It Together"],
  subhead:
    "기획부터 개발, 배포, 그리고 실제 사용자를 만나는 운영까지.\n하나의 서비스를 끝까지 완성할 팀원을 찾습니다.",

  /** TODO: 실제 마감일로 교체. D-day 카운트 기준값 */
  deadline: "2026-09-14T23:59:59+09:00",
  startsAt: "2026년 9월",
  duration: "3개월 이상",
  meeting: "주 1회",

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
    "Issue · Branch · PR 기반 개발",
    "코드 리뷰 경험",
    "서비스 아이디어 기획 경험",
    "요구사항 정의 및 기능 명세",
    "UI/UX 협업 경험",
    "API 및 DB 설계 경험",
    "FE · BE 간 협업 경험",
    "테스트 및 배포 경험",
    "실제 사용자 모집 · 피드백 수집",
    "서비스 개선 및 운영 경험",
    "면접에서 설명할 수 있는 프로젝트",
  ],

  /** 주간 참여 가능 시간 선택지 */
  availability: ["5시간 미만", "5~10시간", "10~15시간", "15시간 이상"],

  /** 개인정보 보유기간 — TODO: 팀 방침 확정 후 조정 */
  privacyRetention: "모집 종료 후 6개월",
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
      "아이디어를 구체적인 기능과 구조로 정리하는 것을 좋아하는 분",
      "개발자·디자이너와 적극적으로 소통할 수 있는 분",
      "시장과 사용자 관점에서 서비스를 고민할 수 있는 분",
      "기획을 넘어 출시·마케팅·운영까지 경험해 보고 싶은 분",
    ],
    questions: [
      {
        id: "domain",
        label: "관심 있는 서비스 도메인과 그 이유를 알려주세요.",
        placeholder: "어떤 문제를 다루는 서비스에 관심이 있는지, 왜 그런지",
        required: true,
      },
      {
        id: "pmExp",
        label: "기획 · 마케팅 · 콘텐츠 관련 경험이 있다면 적어주세요.",
        placeholder: "관련 전공이나 경험이 없어도 괜찮습니다. 없으면 비워두셔도 됩니다.",
        required: false,
      },
    ],
  },
  {
    id: "frontend",
    no: "02",
    title: "Front-End",
    label: "Front-End",
    open: false,
    headcount: "1명 모집 완료",
    summary: "React / Next.js로 사용자가 실제로 만지는 화면을 만듭니다.",
    points: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Git / GitHub"],
    wants: [
      "React 또는 Next.js 개발 경험이 있는 분",
      "API 연동 경험이 있거나 경험해 보고 싶은 분",
      "맡은 기능을 끝까지 구현하려는 책임감이 있는 분",
    ],
    questions: [
      {
        id: "feExp",
        label: "React / Next.js 사용 경험을 알려주세요.",
        placeholder: "만들어 본 것, 사용해 본 기간, 어려웠던 점 등",
        required: true,
      },
      {
        id: "apiExp",
        label: "API 연동 경험이 있다면 적어주세요.",
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
    open: false,
    headcount: "1명 모집 완료",
    summary: "API와 DB를 설계하고, 서비스를 배포하고 운영합니다.",
    points: ["Spring Boot / Node.js / FastAPI", "PostgreSQL", "REST API", "AWS 등 Cloud", "Git / GitHub"],
    wants: [
      "백엔드 API 개발 경험이 있거나 역량을 키우고 싶은 분",
      "DB 설계 및 서버 개발에 관심이 있는 분",
      "배포 및 운영까지 경험해 보고 싶은 분",
    ],
    questions: [
      {
        id: "beStack",
        label: "주로 사용하는 언어와 프레임워크를 알려주세요.",
        placeholder: "예: Java / Spring Boot, Node.js / Express …",
        required: true,
      },
      {
        id: "beOps",
        label: "DB 설계 또는 배포 경험이 있다면 적어주세요.",
        placeholder: "없으면 비워두셔도 됩니다.",
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
        id: "figma",
        label: "Figma 사용 수준을 알려주세요.",
        placeholder: "컴포넌트 / 오토레이아웃 / 프로토타입 등 어디까지 다뤄보셨는지",
        required: true,
      },
      {
        id: "handoff",
        label: "개발자와 협업해 본 경험이 있다면 적어주세요.",
        placeholder: "없으면 비워두셔도 됩니다.",
        required: false,
      },
    ],
  },
];

export const openPositions = positions.filter((p) => p.open);
export const positionById = (id: string) => positions.find((p) => p.id === id);

/** 남은 일수. 마감일이 지났으면 0 */
export function daysLeft(now: Date = new Date()): number {
  const diff = new Date(site.deadline).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function isClosed(now: Date = new Date()): boolean {
  return new Date(site.deadline).getTime() < now.getTime();
}
