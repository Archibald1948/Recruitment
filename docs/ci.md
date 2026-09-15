# CI — GitHub Actions

> 코드가 main에 들어가기 전후로 **lint · 타입 체크 · 빌드**가 깨지지 않았는지 자동으로 확인한다.
> 설정 파일: `.github/workflows/ci.yml`

---

## 1. 언제 도는가

| 이벤트 | 대상 |
|---|---|
| `push` | `main` 브랜치 |
| `pull_request` | `main`으로 향하는 PR |

같은 브랜치(ref)에 새로 푸시하면 **진행 중이던 이전 실행은 취소**된다(`concurrency`). 연달아 푸시해도 마지막 것만 끝까지 돈다.

## 2. 무엇을 하는가

`ubuntu-latest` 러너, Node 22에서 아래 순서로 실행한다. 한 단계라도 실패하면 거기서 멈춘다.

| 순서 | 명령 | 확인하는 것 |
|---|---|---|
| 1 | `npm ci` | `package-lock.json` 그대로 의존성 설치 (npm 캐시 사용) |
| 2 | `npm run lint` | ESLint 규칙 위반 |
| 3 | `npm run typecheck` | 타입 에러 (`next typegen && tsc --noEmit`) |
| 4 | `npm run build` | 프로덕션 빌드 성공 여부 |

작업 전체는 15분이 지나면 강제 종료된다(`timeout-minutes: 15`).

### typecheck가 `next typegen`을 먼저 부르는 이유

`LayoutProps` 같은 전역 라우트 타입은 Next가 `.next/types`에 **생성하는 파일**에 들어 있다.
깨끗한 환경에서 `tsc`만 돌리면 이 타입을 찾지 못해 실패하므로, 타입을 먼저 생성한 뒤 검사한다.

## 3. 로컬에서 똑같이 돌려보기

푸시 전에 같은 검사를 직접 돌려볼 수 있다.

```bash
npm ci
npm run lint
npm run typecheck
npm run build
```

## 4. 결과 확인

- GitHub 저장소의 **Actions** 탭
- 터미널: `gh run list` / `gh run watch <run-id>`

## 5. 참고

- 빌드에 **환경변수(`.env`)가 필요 없다.** 노션·메일 키가 없어도 빌드는 통과하며, CI에는 시크릿을 넣지 않았다.
- 배포는 CI가 아니라 Vercel이 담당한다. CI는 검사만 한다.
