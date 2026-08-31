"use client";

/**
 * 포지션 카드의 "이 포지션 지원하기" 버튼.
 *
 * 단순히 #apply로 스크롤만 시키면 지원 폼의 포지션은 그대로라, 지원자가 방금 고른
 * 포지션을 다시 골라야 한다. 클릭한 포지션을 폼에 그대로 전달한다.
 */
export const SELECT_POSITION_EVENT = "recruit:select-position";

export default function PositionApplyButton({
  positionId,
  label = "이 포지션 지원하기",
  className,
}: {
  positionId: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href="#apply"
      className={className}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(SELECT_POSITION_EVENT, { detail: positionId }),
        );
      }}
    >
      {label}
    </a>
  );
}
