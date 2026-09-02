# Build It, Ship It Together — 모집 사이트

사이드 프로젝트 팀원을 모집하는 원페이지 사이트입니다. 지원서 접수부터 수정, Q&A 응대까지
**노션 데이터베이스 하나로 운영**합니다. 별도의 관리자 화면이 없습니다 — 운영진은 노션에서
값을 고치고, 사이트는 그걸 다시 읽습니다.

> https://builditship.kro.kr

---

## 무엇이 있나

| 화면 | 설명 |
|---|---|
| `/` | 랜딩 — 히어로 → 마퀴 → 어바웃 → 포지션 → 프로세스 → 지원 폼 → Q&A 맛보기 |
| `/apply/[id]?t=<token>` | 메일로 받은 매직 링크. 본인 지원서 조회 · 수정 |
| `/qna` | Q&A 게시판. 질문은 사이트에서, 답변은 노션에서 |
| `/privacy` | 개인정보 수집·이용 안내 |
| `/links` | 채널별 홍보 링크 복사판 (운영자 전용, noindex) |
| `/lab` | 히어로 배경 셰이더 실험실 (noindex) |
| `/admin` | 지원자 목록 + 심사 안내 메일 발송 (운영자 키 필요, noindex) |

API는 `POST /api/apply`, `POST /api/qna`, `GET·PATCH /api/applications/[id]`,
`GET /api/stats`, 그리고 운영자용 `GET /api/admin/applications` ·
`POST /api/admin/notify` 입니다. 자세한 계약은 [`docs/site-plan.md`](docs/site-plan.md) §2.

---

## 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) + React 19 + TypeScript |
| 스타일 | Tailwind CSS v4 + CSS 변수 토큰 |
| 모션 | `motion` |
| 히어로 배경 | `@paper-design/shaders-react` GrainGradient (Apache 2.0) |
| DB · 어드민 | Notion Database (공식 API, SDK v5) |
| 메일 | Gmail SMTP 또는 Resend — 설정된 쪽을 자동 선택 |
| 배포 | Vercel |

---

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값을 채운다 (아래 참고)
npm run dev                  # http://localhost:3000
```

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint
```

### 노션 준비

1. https://www.notion.so/profile/integrations 에서 **내부 통합**을 만듭니다.
   권한은 콘텐츠 읽기 / 업데이트 / 삽입 세 개면 충분합니다.
2. **지원자 관리 · Q&A 문의 게시판 · 사이트 설정** 세 DB 각각에서
   `⋯ → 연결(Connections)`로 그 통합을 추가합니다.
   이 단계를 건너뛰면 토큰이 맞아도 404가 납니다.
3. 발급된 시크릿을 `NOTION_TOKEN`에 넣습니다.

DB 속성 이름은 코드에 그대로 박혀 있습니다. 노션에서 속성 이름이나 `포지션` 셀렉트 옵션을
바꾸면 저장이 깨집니다 — 스키마는 [`docs/site-plan.md`](docs/site-plan.md) §3, §8.5를 보세요.

### 환경 변수

전체 목록은 [`.env.example`](.env.example)에 주석과 함께 있습니다. 최소 구성은 이렇습니다.

| 변수 | 없으면 |
|---|---|
| `NOTION_TOKEN` | 접수 · Q&A 전부 실패 |
| `NOTION_DATABASE_ID` | 지원서 저장 실패 |
| `NOTION_QNA_DATABASE_ID` | `/qna` 목록 조회 실패 |
| `NOTION_SETTINGS_DATABASE_ID` | 마감일이 코드 기본값으로 고정 |
| `TOKEN_PEPPER` | 수정 토큰 발급 실패 |
| `ADMIN_TOKEN` | `/admin`이 잠겨 안내 메일을 보낼 수 없음 |
| `GMAIL_USER` + `GMAIL_APP_PASSWORD` 또는 `RESEND_API_KEY` | 접수는 되지만 메일이 안 나감 |

---

## 이 프로젝트가 내린 선택들

- **관리자 화면을 만들지 않았습니다.** 노션이 곧 어드민입니다. 지원자 심사는 노션 보드에서,
  Q&A 답변은 `답변` 속성에 적으면 사이트에 그대로 반영됩니다.
- **마감일은 코드가 아니라 노션에 있습니다.** 환경변수에 두면 바꿀 때마다 재배포해야 합니다.
  노션에 두면 날짜 칸만 고치면 되고 최대 60초 뒤 반영됩니다. 노션을 못 읽으면 코드 기본값으로
  떨어져, 마감일 조회 실패가 지원 폼 전체를 멈추지 않습니다.
- **심사 안내 메일은 사람이 눌러서 보냅니다.** 노션 상태를 바꾼다고 자동으로 나가지
  않습니다. 메일은 되돌릴 수 없는데 상태를 잘못 눌렀다 되돌리는 일은 흔하기 때문입니다.
  `/admin`에서 내용을 확인하고 발송하며, 발송 기록은 노션에 남습니다.
- **수정 토큰은 원문을 저장하지 않습니다.** `SHA-256(token + PEPPER)`만 노션에 넣고,
  검증은 `timingSafeEqual`로 합니다. 원문은 접수 메일 링크에만 존재합니다.
- **레이트리밋을 2단으로 나눴습니다.** 유효성 실패까지 엄격한 한도에 넣으면 오타를 몇 번 낸
  지원자가 잠깁니다. 무차별 요청은 진입 직후에 막고, 실제 접수 한도는 검증 통과 후에 겁니다.
- **외부 에셋을 핫링크하지 않습니다.** 레퍼런스의 영상·이미지·폰트는 전부 타인 소유라
  자체 구현이나 오픈 라이선스로 대체했습니다. 근거는 [`docs/design-system.md`](docs/design-system.md) §1.
- **노션 API는 평균 초당 3요청 제한**이 있어 읽기는 전부 캐시합니다
  (`/api/stats` 60초, `/qna` 60초 ISR, 랜딩 300초 ISR, 마감일 60초).

---

## 문서

| 파일 | 내용 |
|---|---|
| [`docs/site-plan.md`](docs/site-plan.md) | 정보구조 · 라우트 · 노션 스키마 · API · 배포 · 진행 상황 |
| [`docs/design-system.md`](docs/design-system.md) | 컬러 토큰 · 타이포 · 섹션 구성 · 자체 제작 그래픽 · 모션 규칙 |
| [`docs/recruitment-notice.md`](docs/recruitment-notice.md) | 커뮤니티에 올리는 모집 공고 원문 |

---

## 라이선스

**독점(All Rights Reserved).** 이 저장소의 코드와 산출물은 저작권자의 자산이며,
사전 서면 허락 없는 복제 · 사용 · 배포 · 2차적저작물 작성을 허용하지 않습니다.
자세한 내용은 [`LICENSE`](LICENSE)를 확인하세요.

포함된 서드파티 라이브러리는 각자의 라이선스를 따릅니다.
