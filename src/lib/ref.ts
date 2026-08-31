/**
 * 유입 경로 추적.
 *
 * `?ref=okky` 같은 파라미터로 들어온 방문자가 폼까지 오는 동안 새로고침하거나
 * 다른 페이지를 거치면 파라미터가 사라진다. 첫 방문 때 저장해두고 제출 시 꺼내 쓴다.
 *
 * 값이 없으면 referrer로 추정한다. 커뮤니티에 링크를 뿌릴 때 ref를 빠뜨려도
 * 최소한 어디서 왔는지는 남는다.
 */

const KEY = "recruit:ref";

/** 알려진 유입처는 보기 좋은 이름으로 정리한다. 노션 셀렉트가 지저분해지지 않게. */
const KNOWN_HOSTS: Record<string, string> = {
  "everytime.kr": "everytime",
  "okky.kr": "okky",
  "discord.com": "discord",
  "discord.gg": "discord",
  "instagram.com": "instagram",
  "linkedin.com": "linkedin",
  "github.com": "github",
  "velog.io": "velog",
  "tistory.com": "tistory",
  "blog.naver.com": "naver-blog",
  "cafe.naver.com": "naver-cafe",
  "naver.com": "naver",
  "google.com": "google",
  "t.co": "twitter",
  "x.com": "twitter",
  "open.kakao.com": "kakao",
};

/** 노션 셀렉트에 그대로 들어가므로 안전한 문자만 남긴다. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function fromReferrer(): string {
  if (!document.referrer) return "";
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "";
    for (const [known, label] of Object.entries(KNOWN_HOSTS)) {
      if (host === known || host.endsWith("." + known)) return label;
    }
    return normalize(host);
  } catch {
    return "";
  }
}

/**
 * 첫 방문 시점에 유입 경로를 잡아 저장한다.
 * 이미 저장된 값이 있으면 덮어쓰지 않는다 — 처음 들어온 경로가 진짜 유입처다.
 */
export function captureRef(): void {
  try {
    if (sessionStorage.getItem(KEY)) return;

    const params = new URLSearchParams(window.location.search);
    const explicit = params.get("ref") || params.get("utm_source");
    const value = normalize(explicit || "") || fromReferrer() || "direct";

    sessionStorage.setItem(KEY, value);
  } catch {
    /* 저장소를 못 쓰는 브라우저여도 폼은 동작해야 한다 */
  }
}

/** 제출 시점에 꺼내 쓴다. */
export function readRef(): string {
  try {
    const stored = sessionStorage.getItem(KEY);
    if (stored) return stored;
  } catch {
    /* noop */
  }
  // 저장소를 못 쓰는 경우를 대비해 URL에서 한 번 더 본다.
  const params = new URLSearchParams(window.location.search);
  return normalize(params.get("ref") || params.get("utm_source") || "") || "direct";
}
