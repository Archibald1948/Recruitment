import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스 병합 유틸. shadcn/Magic UI 컴포넌트가 기대하는 형태다.
 *
 * tailwind-merge를 거치는 이유는 뒤에 온 클래스가 앞의 같은 속성을 확실히
 * 덮어쓰게 하기 위해서다. 단순 문자열 연결이면 `absolute`와 `fixed`가 함께 남아
 * 스타일시트 순서에 따라 결과가 달라진다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
