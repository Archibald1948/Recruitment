# 커밋 컨벤션 — husky + commitlint

> 커밋 메시지가 **Conventional Commits** 형식이 아니면 커밋 자체를 막는다.
> 설정 파일: `.husky/commit-msg`, `commitlint.config.js`

## 1. 구성

| 도구 | 역할 |
|---|---|
| **husky** | git 훅(hook)을 저장소에 파일로 두고 팀 전체가 공유하게 한다 |
| **commitlint** | 커밋 메시지가 규칙에 맞는지 검사한다 |
| `@commitlint/config-conventional` | Conventional Commits 기본 규칙 묶음 |

### 동작 흐름

```
git commit
  └─ .husky/commit-msg 훅 실행
       └─ npx commitlint --edit "$1"
            ├─ 통과 → 커밋 완료
            └─ 실패 → 에러 출력 후 커밋 취소
```

## 2. 설치

따로 할 일은 없다. `npm install`(또는 `npm ci`)을 하면 `prepare` 스크립트(`husky`)가 실행되어 훅이 자동으로 연결된다.

훅이 동작하지 않으면 한 번 더 실행한다.

```bash
npm run prepare
```

## 3. 메시지 형식

```
type(scope): 요약

본문 (선택) — 무엇을, 왜 바꿨는지

푸터 (선택)
```

- `scope`는 선택이다. `feat: 요약`도 된다.
- 요약은 한글로 써도 된다(대소문자 검사 `subject-case`를 껐다).
- `type`과 요약은 **비워둘 수 없다.**

### 허용하는 type

| type | 용도 |
|---|---|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `style` | 스타일 수정 (기능 변화 없음) |
| `refactor` | 리팩토링 |
| `test` | 테스트 |
| `chore` | 빌드, 패키지 관리 등의 작업 |
| `perf` | 성능 개선 |
| `ci` | CI/CD 관련 설정 |
| `build` | 빌드 관련 작업 |
| `revert` | 이전 커밋 되돌리기 |

이 밖의 기본 규칙(헤더 100자 제한, 본문 앞 빈 줄 등)은 `config-conventional`을 따른다.

## 4. 예시

```bash
# 통과
git commit -m "feat(apply): 마감 칩 추가"
git commit -m "docs: CI 설명 문서 작성"

# 실패
git commit -m "마감 칩 추가"          # type 없음
git commit -m "update: 마감 칩 추가"  # 허용하지 않는 type
git commit -m "feat:"                 # 요약 없음
```

실패하면 이런 메시지가 뜬다.

```
✖   type must be one of [feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert] [type-enum]
```

## 5. 메시지를 미리 검사하기

커밋하지 않고 메시지만 확인할 수 있다.

```bash
echo "feat(ci): 테스트" | npx commitlint
```
