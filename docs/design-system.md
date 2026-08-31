# 디자인 시스템 — 모집 사이트

> 레퍼런스 A(단일 뷰포트 영상 히어로)와 B(스크롤 서사형 포트폴리오)를 병합한 **확정안**.
> 원본 레퍼런스의 외부 에셋(CloudFront MP4 / figma.site PNG / motionsites.ai GIF / higgs.ai 이미지)은
> 전부 **타인 소유 핫링크라 폐기**했고, 아래 항목은 모두 자체 구현 또는 오픈 라이선스로 대체했다.

---

## 1. 병합 원칙

| 구간 | 출처 | 내용 |
|---|---|---|
| 히어로 | **A안** | 메시 그라디언트 웨이브 + 도트 글리프 텍스처 + 도트 폰트 헤드라인 + 스탯 카운트업 |
| 이음매 | 신규 | 히어로 하단 `#0C0C0C` 페이드 → 이후 섹션과 무이음 연결 |
| 스크롤 이후 전 구간 | **B안** | 마퀴 / 어바웃 / 넘버링 리스트 / sticky 스택 카드 / 흰 섹션 대비 |
| 지원 폼 | 신규 | Notion 연동 |

### 폐기하고 대체한 것

| 원본 | 문제 | 대체 |
|---|---|---|
| A안 CloudFront MP4 배경 | 타인 에셋, 2MB+, 색 제어 불가 | **`@paper-design/shaders-react` MeshGradient** (Apache 2.0) |
| A안 BubbledotICG-FinePos (OnlineWebFonts) | 라이선스 출처 불명 | **캔버스 도트 매트릭스 렌더러** (§5.3). Google Fonts 픽셀 폰트는 전부 네모 픽셀이라 둥근 도트가 안 나온다 |
| A안 "Trusted by 2000+ Enterprises" + MS/Amazon/Google 로고 | 허위 표시 | **실제 수치**(D-day / 지원자 수 / 파트 수 / 기간) |
| B안 motionsites.ai GIF 21개 | 타인 에셋 핫링크 | **텍스트 배지 마퀴** (협업툴·기술 스택) |
| B안 figma.site 3D 오브젝트 4개 | 타인 에셋 핫링크 | **자체 픽셀 SVG 오브젝트 4종** (§5.2) |
| B안 higgs.ai 프로젝트 이미지 9개 | 타인 에셋 핫링크 | 프로세스 카드(이미지 없는 타이포 레이아웃) |
| B안 Kanit 폰트 | 한글 미지원 | 영문 = Pixelify Sans / 한글 = Pretendard |

---

## 2. 컬러 토큰

```css
--bg:            #0C0C0C;   /* 기본 배경 (B안) */
--surface-light: #FFFFFF;   /* 포지션 섹션 반전 배경 */
--ink:           #0C0C0C;   /* 흰 배경 위 텍스트 */
--text:          #FFFFFF;
--text-dim:      #D7E2EA;   /* 본문 (B안) */
--muted:         #8E8E8E;   /* 라벨 (A안) */
--line:          rgba(215, 226, 234, 0.15);
--line-ink:      rgba(12, 12, 12, 0.15);

/* 헤딩 그라디언트 (B안 .hero-heading) */
--grad-heading:  linear-gradient(180deg, #646973 0%, #BBCCD7 100%);

/* CTA — 검은 글씨의 흰 알약에 은은한 흰 글로우 (레퍼런스 Get Started) */
--cta-glow:      0 0 0 1px rgba(255,255,255,.15), 0 0 22px rgba(255,255,255,.32), 0 0 44px rgba(255,255,255,.12);
--accent:        #C98A94;   /* 폼 강조 — 배경 모브 톤 */
```

### 히어로 배경 — 다색 그라디언트 + 캔버스 파도 2겹

**라디얼 그라디언트로는 이 형태가 나오지 않는다.** 타원은 가장자리가 매끈해서
"덩어리 두 개가 겹친" 인상이 아니라 하나의 뭉개진 그림자로 읽힌다.
여러 번 시도했지만 전부 같은 결과였다.

그래서 파도는 **캔버스로 직접 그린다.** 여러 사인파를 합성한 물결 곡선을 윗변으로
삼는 도형 두 개를 그리고, 각각 윗변에 따뜻한 테두리를 두고 아래로 어두워지게 한다.

```
1) 세로 그라디언트   파도 위 영역의 색을 전부 담당. 검정을 넣지 않는다
   #A8A6C1 → #B9B7CB → #C6C4D4 → #CAC7D2 → #DDC6D6
   → #EFCADD → #E9C2C6 → #E1B5AC → #DB898B → #AE6A61

2) 좌우 비대칭 틴트   왼쪽 살구 / 오른쪽 라벤더

3) 파도 1 (0.33)     테두리 #E8A4A2 → 검정. **아래쪽에서 투명해진다**
4) 파도 2 (0.72)     테두리 #D68474 → #0C0C0C 로 바닥까지

5) 그레인            없으면 CSS 그라디언트 티가 난다
```

**핵심은 파도 1이 아래쪽에서 투명해지는 것.** 그래야 그 아래 세로 그라디언트의
밝은 살구빛 띠가 드러나고, 그 띠가 두 파도를 갈라 보이게 한다.
파도 1이 바닥까지 어두우면 두 파도가 하나로 붙어 보인다.

- 물결은 사인파 3개 합성 (기본파 + 2.3배 + 3.7배). 하나만 쓰면 규칙적인 물결이 되어 인공적이다
- 두 파도의 흔들림 주기는 19초·27초로 어긋나게 둔다
- 가장자리 블러는 11~13px. 더 키우면 채움이 날아가 흐릿해진다

---

## 3. 타이포그래피

| 역할 | 폰트 | 라이선스 |
|---|---|---|
| 디스플레이(영문 헤드라인·스탯 심볼) | **Pixelify Sans** | OFL (Google Fonts) |
| 본문·UI (한글/영문) | **Pretendard Variable** | OFL |
| 한글 도트 액센트(선택) | 둥근모꼴+ Fixedsys | 퍼블릭 도메인 |

```css
--font-display: "Pixelify Sans", "Courier New", monospace;
--font-sans:    "Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif;
```

### 스케일

```css
/* 히어로 헤드라인 — 2줄, 줄마다 nowrap (A안) */
font-size: clamp(2rem, 8.5vw, 7rem);
letter-spacing: -0.04em;          /* ≤720px: -0.06em */
line-height: 1.12;                /* ≤720px: 1.05 */

/* 섹션 헤딩 (B안) */
font-size: clamp(3rem, 12vw, 160px);
font-weight: 900; text-transform: uppercase;
letter-spacing: -0.02em; line-height: 1;

/* 넘버링 (포지션·프로세스 카드) */
font-size: clamp(3rem, 10vw, 140px); font-weight: 900;

/* 항목명 */      font-size: clamp(1rem, 2.2vw, 2.1rem);
/* 본문 */        font-size: clamp(0.9rem, 1.6vw, 1.15rem); line-height: 1.7;
/* 스탯 값 */     font-size: clamp(1.125rem, 2.2vw, 1.625rem); font-variant-numeric: tabular-nums;
/* 스탯 라벨 */   font-size: clamp(0.6875rem, 1.2vw, 0.78rem); color: var(--muted);
```

한글은 도트 폰트가 렌더되지 않으므로 **헤드라인만 영문**, 나머지는 Pretendard.

---

## 4. 섹션 구성

```
┌─ HERO ──────────────────────────────── 100dvh
│   MeshGradient 웨이브 + 글리프 텍스처
│   헤드라인 2줄 / 서브 / CTA / 스탯 4
│   ▼ 하단 30vh #0C0C0C 페이드
├─ MARQUEE ───────────── 협업툴·스택 배지 2줄 (역방향)
├─ ABOUT ─────────────── 팀장 소개 (문자 리빌 1문단)
├─ POSITIONS ─────────── 흰 배경 rounded-t, 01~04
├─ PROCESS ───────────── sticky 스택 카드 3장
└─ APPLY ──────────────── 지원 폼 → Notion
```

### 4.1 HERO

- 높이 `100dvh`, `overflow-x: clip`
- 배경: `<MeshGradient />` absolute inset-0, z-0
- 그 위 **글리프 텍스처** 레이어 (§5) z-1, `pointer-events: none`
- 콘텐츠 z-2
- 하단 페이드: `height: 30vh; background: linear-gradient(to bottom, transparent, #0C0C0C)`
- 헤드라인 2줄, 줄마다 `headlineFade 0.85s cubic-bezier(0.22,1,0.36,1)`, delay `0.12s` / `0.3s`
- 스탯 4개: 카운트업(easeOutCubic, `1500 + i*80`ms, 시작 `480 + i*90`ms), IntersectionObserver threshold 0.25, 1회만

### 4.2 MARQUEE

- 2줄, 스크롤 위치 기반 `translateX` (1줄 →, 2줄 ←)
- offset = `(scrollY - sectionTop + innerHeight) * 0.3`
- 배지는 **텍스트 pill** (로고 이미지 미사용 — 상표 리스크 회피)
- 각 줄 콘텐츠 3배 복제로 무한 루프, `will-change: transform`, passive 리스너

### 4.3 ABOUT

- `min-h-screen` 중앙 정렬
- 헤딩 `About` + **문자단위 스크롤 리빌 1문단만** (opacity 0.2 → 1, offset `['start 0.8','end 0.2']`)
- ⚠️ 한글 문단에 문자단위 애니메이션을 남발하면 DOM 폭증 + 스크린리더 파손 → **이 한 문단으로 제한**
- 나머지(기술 경험 목록 등)는 일반 페이드

### 4.4 POSITIONS (흰 배경)

- `background: #FFF`, `border-radius: 40px 40px 0 0` (sm 50 / md 60)
- 항목: `번호 | 이름 + 설명 + 태그` 가로 배치, 1px `--line-ink` 구분선, `py-8 sm:py-10 md:py-12`
- 스태거 `i * 0.1s`
- **모집 완료 포지션은 번호·이름을 dim 처리하고 `모집 완료` 배지** 표시

### 4.5 PROCESS (sticky 스택 카드)

- `#0C0C0C`, `rounded-t-[40/50/60px]`, `-mt-10 sm:-mt-12 md:-mt-14`, z-10
- 카드 3장: `개발 프로세스` / `프로젝트 일정` / `얻어갈 수 있는 것`
- 각 카드 `sticky top-24 md:top-32`, 컨테이너 `h-[85vh]`
- `targetScale = 1 - (total - 1 - index) * 0.03`, `top: index * 28px`
- 테두리 `2px solid #D7E2EA`, radius `40/50/60px`

### 4.6 APPLY

- 다크 배경, 폼 컨테이너 `max-w-2xl`
- 포지션 선택 → 해당 포지션 전용 질문 노출 (§site-plan)
- 제출 중 CTA 비활성 + 스피너, 완료 시 접수 번호 + 안내

---

## 5. 자체 제작 그래픽

### 5.1 글리프 텍스처

> **이 레이어가 히어로의 인상을 결정한다.** 배경 장식이 아니라 화면 상단 절반을
> 채우는 **하나의 텍스처 면**이다. 성기게 깔면 노이즈로 보이고, 옅게 깔면
> 아예 보이지 않는다. 레퍼런스와 가장 크게 벌어졌던 지점이 여기였다.
>
> - 가로 70~85칸(`cell = width / 76`), 상단 30%까지 **밀도 0.95로 꽉 채운다**
> - 최대 투명도 0.3~0.64 — 장식 수준이 아니라 읽히는 밝기
> - 어두운 렌즈(웨이브 1) 상단에서 흡수되며 사라진다

배경에 옅게 깔리는 `0 0 8 8 S S X X` 도트 글자 텍스처. 원본의 시그니처이자 우리 자산.

- `<canvas>` 또는 절대배치 span 그리드
- 문자 집합: `0 1 8 S X # % * < >`
- 셀 크기 `clamp(14px, 1.6vw, 22px)`, 폰트 `--font-display`
- `opacity: 0.06 ~ 0.12`, 개별 글자가 4~9초 주기로 매우 느리게 페이드
- `pointer-events: none`, `aria-hidden="true"`
- `prefers-reduced-motion: reduce` → 정적 렌더

### 5.2 코너 픽셀 오브젝트

About 섹션 양옆이 비어 허전해 보이는 문제를 채우는 장식. 레퍼런스의 3D 오브젝트
4개는 전부 외부 사이트 핫링크라 쓸 수 없어, 히어로의 도트 언어와 같은 결로 직접 그렸다.

- 이미지가 아니라 **SVG 사각형 격자**. 16×16 그리드에 수식으로 형태를 찍는다
- 셀은 `0.86` 크기에 `rx 0.16` — 사이 간격이 도트 매트릭스처럼 읽힌다
- 색은 옅은 회색 → 앰버 → 번트 오렌지 3단 램프를 톤(0~1)으로 보간
- 4종: **초승달**(원 − 어긋난 원) / **궤도 링과 위성**(도넛 + 점) /
  **블록 격자**(3×3 덩어리) / **구체**(좌상단 광원 음영)
- 배치는 네 모서리, `z-0`, `pointer-events: none`, `aria-hidden`
- 진입은 좌우에서 밀려 들어옴(`x: ∓80`, `duration 0.9`, delay `0.1 / 0.15 / 0.25 / 0.3`)
- 모바일에서는 본문과 겹쳐 지저분해지므로 `sm` 미만에서 숨긴다

### 5.3 도트 매트릭스 헤드라인

레퍼런스의 둥근 도트 헤드라인은 폰트로는 재현할 수 없어 캔버스로 직접 그린다.

1. 글자를 **저해상도 오프스크린 캔버스**에 렌더링한다 (픽셀 1개 = 도트 1개)
2. 알파가 있는 자리에만 원을 찍는다

- 격자는 **대문자 높이(`capRows`, 기본 11행)** 기준으로 잡는다. 폭을 먼저 정하면
  긴 줄에서 글자당 도트가 모자라 뭉개진다
- 도트 크기는 **가장 긴 줄 기준으로 한 번만** 계산해 모든 줄이 같은 크기를 쓴다
- 도트 반경 `cell * 0.36`, 자간 `0.06em`
- 원문은 `sr-only`로 제공하고 캔버스는 `aria-hidden`

### 5.4 그레인

`feTurbulence`를 data URI 배경 이미지로 구워 `mix-blend-mode: overlay`, opacity 0.38로
전면에 깐다. **이 레이어가 없으면 CSS 그라디언트 티가 난다.**

---

## 6. 애니메이션 규칙

```
easing   cubic-bezier(0.22, 1, 0.36, 1)   히어로 계열
         cubic-bezier(0.25, 0.1, 0.25, 1) FadeIn 기본
FadeIn   opacity 0 → 1, y 30 → 0, duration 0.7s, viewport { once: true }
히어로   헤드라인 줄별 0.12s·0.3s / 서브 0.28s / CTA 0.4s
스탯     0.5s, 0.58s, 0.66s, 0.74s
```

`prefers-reduced-motion: reduce`: 모든 애니메이션 제거, 최종 상태로 즉시 표시, 카운트업은 최종값 표기, MeshGradient는 정지 프레임.

---

## 7. 반응형

Tailwind 기본 브레이크포인트(sm 640 / md 768 / lg 1024), 모바일 퍼스트, 유동 타이포는 `clamp()`.

- **≤720px**: 스탯 4열 → 2열
- **≤420px**: 헤드라인 letter-spacing `-0.08em`, 스탯 라벨 축소

## 8. 접근성

- 모든 장식 레이어 `aria-hidden`, `pointer-events: none`
- 폼: `<label>` 연결, 에러 `aria-live="polite"`, 포커스 링 유지
- 대비: 흰 섹션 본문 `opacity: 0.6` 이하로 내리지 않음
- 키보드만으로 지원 완료까지 도달 가능해야 함
