# 사이트 설계 — 정보구조 · 데이터 · API

## 1. 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | Next.js (App Router) + TypeScript | 공고에 적힌 팀 FE 스택과 동일 |
| 스타일 | Tailwind CSS v4 + CSS 변수 | 토큰은 `docs/design-system.md` |
| 모션 | `motion` (framer-motion 후속) | sticky 스택, 스크롤 리빌 |
| 히어로 배경 | `@paper-design/shaders-react` MeshGradient | Apache 2.0 |
| 아이콘 | `lucide-react` | |
| DB | **Notion Database** (공식 API) | 어드민 = 노션 자체 |
| 메일 | **Gmail SMTP** (기본) / **Resend** (도메인 확보 후) | 접수 확인 + 수정 링크 |
| 배포 | Vercel | 커스텀 도메인 `builditship.kro.kr` (내도메인.한국, 무료) |

> Notion 통합 토큰은 **서버 전용**. 클라이언트 번들에 절대 노출 금지 → 모든 접근은 Route Handler 경유.
> 통합은 **지원자 DB 페이지 하나에만** 공유한다(워크스페이스 전체 연결 금지).

---

## 2. 라우트

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 (히어로 → 마퀴 → 어바웃 → 포지션 → 프로세스 → 지원 폼) |
| `/apply/[id]?t=<token>` | 지원 내역 **조회 + 수정** (매직 링크) |
| `/privacy` | 개인정보 수집·이용 동의 안내 |
| `POST /api/apply` | 지원서 접수 |
| `GET /api/applications/[id]?t=` | 내 지원서 조회 |
| `PATCH /api/applications/[id]` | 내 지원서 수정 |
| `GET /api/stats` | 지원자 수 등 공개 지표 (60초 캐시) |

---

## 3. Notion 데이터베이스 스키마

DB 이름: **지원자 관리** — 생성 완료

| 항목 | 값 |
|---|---|
| 페이지 | https://app.notion.com/p/55867ca8646d43f8ad6bac20e3b0c9af |
| `NOTION_DATABASE_ID` | `55867ca8646d43f8ad6bac20e3b0c9af` |
| `NOTION_DATA_SOURCE_ID` | `25392f9c-aa5d-4b1e-954e-da54a6fcf3e1` |
| 뷰 | 기본 테이블 + **심사 보드**(상태별 보드, 제출일시 오름차순) |

> `포지션` 셀렉트 옵션 이름은 `src/config/site.ts`의 `title`과 **글자 하나까지 같아야 한다**
> (`기획 / PM` `Front-End` `Back-End` `UI/UX Designer`). 노션에서 이름을 바꾸면 저장이 깨진다.

| 속성명 | 타입 | 값 / 비고 |
|---|---|---|
| `이름` | Title | |
| `이메일` | Email | 사실상 계정 키. **수정 시 변경 불가** |
| `연락처` | Phone | 선택 |
| `포지션` | Select | `기획/PM` `Front-End` `Back-End` `UI/UX Designer` |
| `상태` | Select | `접수됨` `서류 검토` `커피챗` `합류` `보류` |
| `한 줄 소개` | Rich text | |
| `지원 동기` | Rich text | |
| `관련 경험` | Rich text | |
| `포지션별 답변` | Rich text | 포지션 분기 질문 답변 (라벨 포함) |
| `포트폴리오` | URL | GitHub / Notion / Behance 등 링크 |
| `주간 참여 가능 시간` | Select | `5시간 미만` `5~10시간` `10~15시간` `15시간 이상` |
| `유입 경로` | Select | 유입 경로 자동 기록 (§4.5) |
| `개인정보 동의` | Checkbox | |
| `수정 토큰 해시` | Rich text | SHA-256(token + PEPPER). **원문 저장 금지** |
| `제출일시` | Created time | |
| `최종 수정` | Last edited time | |

> 노션에는 유니크 제약이 없다. **중복 제출 검사는 서버에서 이메일로 query 후 판단**한다.
> 노션 API 레이트리밋(평균 3 req/s) 때문에 `/api/stats` 같은 읽기는 60초 캐시 필수.

---

## 4. 지원 폼 항목

### 공통

1. 이름 *(필수)*
2. 이메일 *(필수)* — 수정 링크 발송처. 오타 시 연락 불가 안내 문구 노출
3. 연락처 *(선택)*
4. 지원 포지션 *(필수, 단일 선택)*
5. 한 줄 소개 *(필수, 60자)*
6. 지원 동기 *(필수)* — 프로젝트를 끝까지 함께할 수 있는지 중심
7. 관련 경험 *(선택)*
8. 포트폴리오 / GitHub 링크 *(선택)* — **파일 업로드 없음, 링크만**
9. 주간 참여 가능 시간 *(필수)*
10. 개인정보 수집·이용 동의 *(필수 체크)*

### 포지션 분기 질문

| 포지션 | 질문 |
|---|---|
| 기획/PM | 관심 있는 서비스 도메인과 그 이유 / 기획·마케팅 관련 경험(무관 전공 무방) |
| Front-End | React·Next.js 사용 경험 / API 연동 경험 |
| Back-End | 주 사용 언어·프레임워크 / DB 설계 또는 배포 경험 |
| UI/UX Designer | Figma 사용 수준 / 개발자와 협업해 본 경험 |

### 4.5 유입 경로 추적

커뮤니티마다 링크를 다르게 뿌리고, 어디서 좋은 지원자가 오는지 데이터로 남긴다.

```
https://builditship.kro.kr/?ref=everytime
https://builditship.kro.kr/?ref=okky
https://builditship.kro.kr/?ref=discord
https://builditship.kro.kr/?ref=instagram
```

- **대부분은 `?ref=` 를 붙일 필요가 없다.** 커뮤니티에서 링크를 타고 들어오면
  referrer로 유입처가 자동 기록된다. 카카오톡·DM처럼 referrer가 실리지 않는
  경로에서만 명시적으로 붙인다
- 손으로 타이핑하지 않도록 `/links`(noindex)에서 채널별 링크를 클릭 한 번으로 복사한다
- `?ref=` 와 `?utm_source=` 둘 다 받는다
- **첫 방문 시점에 sessionStorage에 저장한다.** 폼까지 오는 동안 새로고침하거나
  다른 페이지를 거치면 파라미터가 사라지기 때문
- 이미 저장된 값은 덮어쓰지 않는다 — 처음 들어온 경로가 진짜 유입처다
- 파라미터가 없으면 **referrer로 추정**한다. everytime·okky·discord·naver 등
  알려진 도메인은 보기 좋은 이름으로 정리하고, 나머지는 호스트명 그대로 남긴다
- 아무것도 없으면 `direct`
- 노션 셀렉트에 그대로 들어가므로 안전한 문자만 남기고 40자로 자른다

포지션 딥링크도 함께 쓸 수 있다. 프론트엔드 모집 글에는 이렇게 뿌린다:

```
https://builditship.kro.kr/?ref=okky&position=frontend#apply
```

포지션 카드의 "이 포지션 지원하기" 버튼도 같은 방식으로 폼의 포지션을 미리 채운다.

---

### 폼 UX

- 포지션 선택 시 분기 질문이 나타남 + 진행률 표시
- **작성 중 `localStorage` 자동 임시저장** (이탈 방지), 제출 성공 시 삭제
- **연락처 하이픈 자동 삽입** — 02(서울)는 국번이 3~4자리라 따로 처리한다.
  클라이언트뿐 아니라 **서버에서도 정규화**한다. 클라이언트만 하면 API를 직접
  호출하거나 붙여넣은 값이 그대로 저장된다
- **포트폴리오 링크에 `https://` 자동 부착** (blur 시점)
- 제출 전 **클라이언트에서 서버와 같은 검증 함수**를 먼저 돌려 왕복 없이 알려주고,
  첫 오류 항목으로 스크롤·포커스한다. 서버 검증은 그대로 유지 — API 직접 호출을 막아야 한다
- 스팸 방어: 허니팟 필드 + 2단계 레이트리밋 + (선택) Cloudflare Turnstile

### 레이트리밋을 2단계로 나눈 이유

유효성 실패까지 엄격한 한도에 포함하면 **오타를 몇 번 낸 지원자가 잠긴다.**

| 단계 | 한도 | 시점 |
|---|---|---|
| `apply:burst` | 40회 / 10분 | 요청 진입 직후. 무차별 요청만 차단 |
| `apply:create` | 5회 / 10분 | **검증 통과 후.** 실제 접수만 소모 |

---

## 5. 지원서 수정 플로우

```
제출
 └→ crypto.randomBytes(32) → token (원문)
 └→ Notion에 SHA-256(token + PEPPER)만 저장
 └→ Resend 발송: "지원 접수 완료" + /apply/<pageId>?t=<token>

수정
 └→ 서버가 pageId로 페이지 조회 → 해시 대조 (timingSafeEqual)
 └→ 일치 시 기존 값 프리필
 └→ 저장 시 Notion 페이지 업데이트 + 본문에 수정 이력 append
```

규칙:
- **이메일 주소는 변경 불가** (계정 키)
- **마감일 이후 수정 잠금** (조회는 계속 가능)
- 수정 이력은 노션 페이지 본문에 `2026-09-03 14:22 · 지원 동기 수정` 형태로 누적
- 토큰은 메일 링크에만 존재. 분실 시 재발송 요청 → 이메일로 본인 확인 후 재발급

---

## 5.4 도메인

`builditship.kro.kr` — 내도메인.한국에서 받은 무료 도메인. 비용·갱신 부담이 없다.

`kro.kr`은 **공용 서픽스(Public Suffix)** 라서 `builditship.kro.kr`이 최상위처럼
취급된다. 그래서 CNAME이 아니라 **A 레코드**로 연결하고, Vercel이 소유권 확인을
위해 TXT 레코드를 요구한다.

| 종류 | 이름 | 값 |
|---|---|---|
| TXT | `_vercel` | `vc-domain-verify=builditship.kro.kr,...` |
| A | (비움) | `216.198.79.1` |
| A | (비움) | `64.29.17.1` |

> 웹포워딩(Redirect)을 쓰면 주소창에 `vercel.app`이 그대로 보인다. 반드시 DNS 레코드로 건다.

HTTPS 인증서는 Vercel이 자동 발급한다.

---

## 5.5 메일 발송 수단

도메인이 없어도 메일을 보낼 수 있도록 두 가지를 지원하고, **설정된 쪽을 자동으로 고른다.**
`RESEND_API_KEY`가 있으면 Resend, 없고 Gmail 값이 있으면 Gmail SMTP, 둘 다 없으면
콘솔에 수정 링크만 남기고 조용히 넘어간다.

| | 도메인 | 한도 | 발신자 표기 | 도달률 |
|---|---|---|---|---|
| **Gmail SMTP** | 불필요 | ~500통/일 | 개인 Gmail 주소 | 보통 |
| **Resend** | 필요(검증) | 100통/일·3,000통/월 (무료) | 프로젝트 도메인 | 좋음 |

Gmail은 **앱 비밀번호**가 필요하다. 계정 비밀번호로는 안 되고, 2단계 인증을 켜야 발급된다.
Gmail은 인증된 계정 주소로만 보낼 수 있어 `MAIL_FROM_NAME`으로 표시 이름만 바꾼다.

> 메일 발송 실패가 **접수 자체를 되돌리지는 않는다.** 실패해도 접수 완료 화면에
> 수정 링크를 직접 띄워 지원자가 링크를 잃지 않게 한다.

---

## 6. 노션 연동 절차

DB는 만들어졌지만, 앱은 **자체 통합 토큰**으로 접근한다. MCP 커넥터와는 별개다.

1. https://www.notion.so/profile/integrations 에서 **내부 통합(Internal integration)** 생성
   - 이름: 아무거나 (예: `모집 사이트`)
   - 연결할 워크스페이스: `Main`
   - 권한: **콘텐츠 읽기 / 콘텐츠 업데이트 / 콘텐츠 삽입** 세 개면 충분하다.
     사용자 정보 읽기는 필요 없다
2. 발급된 시크릿(`ntn_`으로 시작)을 복사
3. **지원자 관리 DB 페이지 우측 상단 `⋯` → 연결(Connections) → 1번에서 만든 통합 추가**
   - 이 단계를 건너뛰면 토큰이 맞아도 404가 난다
   - 통합은 **이 DB 하나에만** 공유한다. 워크스페이스 전체를 열지 않는다
4. 시크릿을 `.env.local`의 `NOTION_TOKEN`과 Vercel 환경변수에 넣는다

```bash
# Vercel (프로덕션)
vercel env add NOTION_TOKEN production
vercel env add NOTION_TOKEN development
```

`NOTION_DATABASE_ID`와 `NOTION_DATA_SOURCE_ID`는 이미 Vercel에 등록되어 있다.

---

## 7. 환경 변수

```
NOTION_TOKEN=              # 노션 내부 통합 시크릿 (서버 전용)
NOTION_DATABASE_ID=        # 지원자 관리 DB id
RESEND_API_KEY=            # 서버 전용
MAIL_FROM="팀 프로젝트 <noreply@도메인>"
APP_URL=https://...        # 매직 링크 절대 URL 생성용
TOKEN_PEPPER=              # 수정 토큰 해시용 시크릿 (32바이트 랜덤)
```

`.env.local`은 커밋하지 않는다. Vercel 프로젝트 환경변수에 동일하게 등록.

---

## 8. 사이트 설정 (`src/config/site.ts`)

자주 바뀌는 값은 코드 곳곳에 흩지 않고 여기 한 곳에서 관리한다.

- 모집 마감일 (D-day 카운트 기준)
- 포지션별 모집 인원 / 모집 완료 여부
- 프로젝트 시작 예정일, 예상 기간
- 협업 툴 · 기술 스택 배지 목록
- 연락처

---

## 9. 남은 결정 사항

- [ ] **모집 마감일** — 현재 `2026-09-14` 임시값. D-day 카운트와 접수 차단에 직결.
      코드를 고치지 않고 `NEXT_PUBLIC_DEADLINE` 환경변수로 바꿀 수 있다
- [ ] **포지션별 모집 인원** — 네 포지션 모두 `n명` 자리
      (프론트엔드·백엔드는 각 1명이 합류했을 뿐 모집은 계속 열려 있다)
- [ ] 도메인 확정 → Resend DNS 등록 (SPF/DKIM)
- [ ] 로고 / 파비콘
- [ ] 개인정보 보유기간 문구 (예: 모집 종료 후 6개월 뒤 파기)
