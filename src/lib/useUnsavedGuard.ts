"use client";

import { useEffect } from "react";

/**
 * 작성 중인 내용을 두고 나가려 할 때 붙잡는다.
 *
 * 두 갈래를 모두 막아야 한다.
 * 1) 탭 닫기·새로고침·주소창 이동 → beforeunload.
 *    최신 브라우저는 우리가 준 문구를 무시하고 자기 경고를 띄운다.
 *    preventDefault가 유일한 신호라 문구는 여기서 쓸 수 없다.
 * 2) 사이트 안 링크 클릭 → 캡처 단계에서 가로채 직접 확인창을 띄운다.
 *    App Router에는 이동을 막을 수 있는 라우터 이벤트가 없어서
 *    앵커 클릭을 잡는 것이 실질적으로 유일한 방법이다.
 */
export function useUnsavedGuard(dirty: boolean, message: string) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 오래된 브라우저는 아직 이 값을 봐야 경고를 띄운다.
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      // 새 탭으로 여는 클릭은 지금 페이지를 떠나는 게 아니다.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href") ?? "";
      // 같은 문서 안 앵커나 제자리 링크는 내용이 날아가지 않는다.
      if (href.startsWith("#") || anchor.href === location.href) return;

      if (!window.confirm(message)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    // 캡처 단계여야 Link의 클릭 처리보다 먼저 잡는다.
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty, message]);
}
