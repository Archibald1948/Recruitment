/**
 * 아주 가벼운 인메모리 레이트리밋.
 * 서버리스에서는 인스턴스별로만 동작하지만, 단순 스팸을 막는 데는 충분하다.
 * 트래픽이 커지면 Upstash 같은 외부 저장소로 교체한다.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
