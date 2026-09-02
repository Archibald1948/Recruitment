/**
 * 운영자 화면으로 들어가는 비밀 경로.
 *
 * /admin은 누구나 주소창에 쳐볼 수 있는 이름이다. 잠금 화면이 뜨는 것만으로도
 * "여기 뭔가 있다"가 확인되므로, 입구 자체를 환경변수로 옮긴다. 값은 저장소에
 * 남지 않는다.
 *
 * 파일 기반 라우팅이라 실제 파일은 /admin에 그대로 두고, proxy가 비밀 경로를
 * 그쪽으로 바꿔 그린다. 대신 /admin으로 직접 들어오면 진짜 404를 준다.
 *
 * 값이 없으면 입구가 아예 없다. 환경변수를 깜빡한 배포에서 예측 가능한 주소가
 * 열려 있는 쪽이 훨씬 위험하다.
 */
export function adminPath(): string | null {
  const raw = process.env.ADMIN_PATH?.trim().replace(/^\/+|\/+$/g, "");
  // 슬래시가 섞이면 경로 비교가 어긋난다. 한 조각짜리 이름만 받는다.
  if (!raw || raw.includes("/")) return null;
  return `/${raw}`;
}
