/**
 * 지원자가 고른 희망 미팅 시간을 사람이 읽는 문구로 바꾼다.
 *
 * 지원 폼에서 시간을 고르던 방식은 상시 모집으로 바뀌며 없어졌다. 이제 미팅은
 * 서류 통과 뒤 메일로 맞춘다. 다만 그 전에 접수한 지원자의 희망 시간은 노션에
 * 남아 있고, 운영자 화면이 그 값을 계속 보여준다.
 *
 * 모든 시각은 한국 시간이다.
 */

/** 저장된 ISO를 사람이 읽는 문구로. "9월 12일 (토) 오전 9:00" */
export function formatSlot(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
